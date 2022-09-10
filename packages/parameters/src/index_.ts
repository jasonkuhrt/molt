import { FlagName } from '@molt/types'
import { Any } from 'ts-toolbelt'
import { z } from 'zod'

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
  parse: (processArguments?: string[]) => ParametersToArguments<ParametersSchema>
  schema: ParametersSchema
}

export const create = <Schema extends z.ZodRawShape>(schema: Schema): Definition<Schema> => {
  return {
    parse: (processArguments) => {
      // eslint-disable-next-line
      return parseProcessArguments(schema, processArguments ?? process.argv.slice(2)) as any
    },
    schema,
  }
}

const parseProcessArguments = (schema: z.ZodRawShape, processArguments: string[]): object => {
  const args: Record<string, unknown> = {}
  const flagSpecs = parseFlagSpecExpressions(schema)
  let propertyName: string | null = null

  for (const chunk of processArguments) {
    if (propertyName) {
      args[propertyName] = chunk
      propertyName = null
      continue
    }

    const chunkNormalized = stripeDashPrefix(chunk)

    const flagNameSpec = flagSpecs.find((spec) => {
      return (
        spec.long === chunkNormalized ||
        spec.short === chunkNormalized ||
        spec.aliases.long.includes(chunkNormalized) ||
        spec.aliases.short.includes(chunkNormalized)
      )
    })

    if (!flagNameSpec) throw new Error(`Could not find flag spec for flag name: ${chunk}`)
    propertyName = flagNameSpec._tag === `Short` ? flagNameSpec.short : flagNameSpec.long
    continue
  }

  return args
}

const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

const parseFlagSpecExpressions = (schema: z.ZodRawShape): FlagName.Types.ParsedFlagNames[] =>
  Object.keys(schema).map((expression) => {
    const names = expression
      .trim()
      .split(` `)
      .map((exp) => exp.trim())
      .map(stripeDashPrefix)

    // eslint-disable-next-line
    const spec: FlagName.Types.ParsedFlagNames = {
      long: undefined,
      short: undefined,
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

    if (spec.short && spec.long) spec._tag = `LongShort`
    else if (spec.short) spec._tag = `Short`
    else if (spec.long) spec._tag = `Long`
    else throw new Error(`Invalid flag name: ${names.join(` `)}`)

    return spec
  })
