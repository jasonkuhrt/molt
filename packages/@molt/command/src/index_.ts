import { FlagName } from '@molt/types'
import { Any } from 'ts-toolbelt'
import { z } from 'zod'

const casesHandled = (value: never) => {
  throw new Error(`Unhandled case: ${String(value)}`)
}

export type FlagSpec =
  | {
      _tag: 'Long'
      canonical: string
      schema: z.ZodType
      long: string
      short: undefined
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }
  | {
      _tag: 'Short'
      schema: z.ZodType
      canonical: string
      long: undefined
      short: string
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }
  | {
      _tag: 'LongShort'
      schema: z.ZodType
      canonical: string
      long: string
      short: string
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }

const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

const parseFlagSpecs = (schema: z.ZodRawShape): FlagSpec[] =>
  Object.entries(schema).map(([expression, schema]) => {
    const names = expression
      .trim()
      .split(` `)
      .map((exp) => exp.trim())
      .map(stripeDashPrefix)

    // eslint-disable-next-line
    const spec: FlagSpec = {
      long: undefined,
      short: undefined,
      schema,
      aliases: {
        long: [],
        short: [],
      },
      // eslint-disable-next-line
    } as any

    for (const name of names) {
      if (name.length === 1)
        if (spec.short) spec.aliases.short.push(name)
        else spec.short = name
      else if (name.length > 0)
        if (spec.long) spec.aliases.long.push(name)
        else spec.long = name
      else throw new Error(`Invalid flag name: ${name}`)
    }

    if (spec.short && spec.long) {
      spec._tag = `LongShort`
      spec.canonical = spec.long
    } else if (spec.short) {
      spec._tag = `Short`
      spec.canonical = spec.short
    } else if (spec.long) {
      spec._tag = `Long`
      spec.canonical = spec.long
    } else throw new Error(`Invalid flag name: ${names.join(` `)}`)

    return spec
  })

// prettier-ignore
type FlagSpecExpressionParseResultToPropertyName<result extends FlagName.Types.SomeParseResult> = 
	FlagName.Errors.$Is<result> extends true 		? result :
	result extends { long: string } 						? result['long'] :
	result extends { short: string} 						? result['short'] :
																							  never

// prettier-ignore
type ParametersToArguments<ParametersSchema extends z.ZodRawShape> = Any.Compute<{
  [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]:
    z.infer<ParametersSchema[FlagSpecExpression]>
}>

type Definition<ParametersSchema extends z.ZodRawShape> = {
  parseOrThrow: (processArguments?: string[]) => ParametersToArguments<ParametersSchema>
  settings: (newSettings: { description?: string }) => Definition<ParametersSchema>
  schema: ParametersSchema
}

export const create = <Schema extends z.ZodRawShape>(schema: Schema): Definition<Schema> => {
  const api = {
    settings: (_newSettings) => {
      return api
    },
    parseOrThrow: (processArguments) => {
      // eslint-disable-next-line
      return parseProcessArguments(schema, processArguments ?? process.argv.slice(2)) as any
    },
    schema,
  } as Definition<Schema>
  return api
}

type ArgumentsInput = string[]

type ArgumentsInputStructuredArgFlag = {
  _tag: 'Arguments'
  arguments: string[]
}

type ArgumentsInputStructuredBooleanFlag = {
  _tag: 'Boolean'
  negated: boolean
}

type ArgumentsInputStructured = Record<
  string,
  ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag
>

const structureProcessArguments = (argumentsInput: ArgumentsInput): ArgumentsInputStructured => {
  const structured: ArgumentsInputStructured = {}
  let index = 0
  let currentFlag: null | ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag = null

  for (const argument of argumentsInput) {
    const trimmed = argument.trim()

    if (isFlagInput(trimmed)) {
      const noDashPrefix = stripeDashPrefix(trimmed)
      if (
        !argumentsInput[index + 1] ||
        //eslint-disable-next-line
        (argumentsInput[index + 1] && isFlagInput(argumentsInput[index + 1]!))
      ) {
        currentFlag = {
          _tag: `Boolean`,
          negated: noDashPrefix.startsWith(`no-`),
        }
        const noNegatePrefix = noDashPrefix.replace(`no-`, ``)
        structured[noNegatePrefix] = currentFlag
      } else {
        currentFlag = {
          _tag: `Arguments`,
          arguments: [],
        }
        structured[noDashPrefix] = currentFlag
      }
    } else if (currentFlag && currentFlag._tag === `Arguments`) {
      currentFlag.arguments.push(trimmed)
    }

    index++
  }

  // console.log({ structured })
  return structured
}

const findStructuredArgument = (
  structuredArguments: ArgumentsInputStructured,
  flagSpec: FlagSpec
): null | {
  via: 'short' | 'long'
  givenName: string
  arg: ArgumentsInputStructuredArgFlag | ArgumentsInputStructuredBooleanFlag
} => {
  // TODO handle aliases
  switch (flagSpec._tag) {
    case `Long`:
      if (structuredArguments[flagSpec.long])
        return {
          via: `long`,
          givenName: flagSpec.long,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.long]!,
        }
      return null
    case `Short`:
      if (structuredArguments[flagSpec.short])
        return {
          via: `short`,
          givenName: flagSpec.short,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.short]!,
        }
      return null
    case `LongShort`:
      if (structuredArguments[flagSpec.long])
        return {
          via: `long`,
          givenName: flagSpec.long,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.long]!,
        }
      if (structuredArguments[flagSpec.short])
        return {
          via: `short`,
          givenName: flagSpec.short,
          //eslint-disable-next-line
          arg: structuredArguments[flagSpec.short]!,
        }
      return null
    default:
      casesHandled(flagSpec)
  }
  return null
}

const parseProcessArguments = (schema: z.ZodRawShape, processArguments: ArgumentsInput): object => {
  const args: Record<string, unknown> = {}
  const flagSpecs = parseFlagSpecs(schema)
  const propertyName: string | null = null
  const structuredArguments = structureProcessArguments(processArguments)
  // console.log(structuredArguments)

  for (const flagSpec of flagSpecs) {
    // console.log(flagSpec.schema._def)

    const input = findStructuredArgument(structuredArguments, flagSpec)
    // console.log(input)

    if (!input) {
      // @ts-expect-error todo
      if (typeof flagSpec.schema._def.defaultValue === `function`) {
        // @ts-expect-error todo
        //eslint-disable-next-line
        args[flagSpec.canonical] = flagSpec.schema._def.defaultValue()
      }
      continue
    }

    switch (input.arg._tag) {
      case `Boolean`:
        // @ts-expect-error todo
        if (flagSpec.schema._def.typeName !== `ZodBoolean`) {
          throw new Error(`Missing argument for flag "${input.givenName}".`)
        }
        args[flagSpec.canonical] = input.arg.negated ? false : true
        continue
      case `Arguments`:
        if (input.arg.arguments.length === 0) {
          throw new Error(`Missing argument for flag "${input.givenName}".`)
        }
        try {
          const argument =
            // @ts-expect-error todo
            flagSpec.schema._def.typeName === `ZodNumber`
              ? Number(input.arg.arguments[0])
              : input.arg.arguments[0]
          args[flagSpec.canonical] = flagSpec.schema.parse(argument)
          //eslint-disable-next-line
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(
              `Invalid argument for flag: "${input.givenName}". The error was:\n${error
                .format()
                ._errors.join(`\n`)}`
            )
          }
          throw error
        }
    }
  }

  if (propertyName) {
    throw new Error(`Missing argument for flag: "${String(propertyName)}"`)
  }

  return args
}

const isFlagInput = (input: string) => {
  return input.trim().startsWith(`--`) || input.trim().startsWith(`-`)
}
