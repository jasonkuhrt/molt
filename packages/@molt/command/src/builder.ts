import { Help } from './Help/index.js'
import type { FlagSpecExpressionParseResultToPropertyName } from './helpers.js'
import { lowerCaseObjectKeys } from './helpers.js'
import { getLowerCaseEnvironment } from './helpers.js'
import { Input } from './Input/index.js'
import { ParameterSpec } from './ParameterSpec/index.js'
import { Settings } from './Settings/index.js'
import type { FlagName } from '@molt/types'
import type { Any } from 'ts-toolbelt'
import type { z } from 'zod'

// prettier-ignore
type ParametersToArguments<ParametersSchema extends z.ZodRawShape> = Any.Compute<{
  [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]:
    z.infer<ParametersSchema[FlagSpecExpression]>
}>

type Definition<ParametersSchema extends z.ZodRawShape> = {
  schema: ParametersSchema
  settings: (newSettings: Settings.Input<ParametersSchema>) => Definition<ParametersSchema>
  parse: (inputs?: {
    line?: Input.Line.RawInputs
    environment?: Input.Environment.RawInputs
  }) => ParametersToArguments<ParametersSchema>
}

// prettier-ignore
interface Builder<Spec extends SomeSpec> {
  parameter: <Name extends string, Schema extends ParameterSpec.SomeZodType>(
    name: 
    FlagName.Errors.$Is<FlagName.Parse<Name, { usedNames: Values<Spec['Parameters']>['NameUnion'], reservedNames: 'help' | 'h' }>> extends true
      ?                 FlagName.Parse<Name, { usedNames: Values<Spec['Parameters']>['NameUnion'], reservedNames: 'help' | 'h' }>
      : Name,
    schema: Schema
  ) =>
    Builder<{
      Parameters: Spec['Parameters'] & {
        [k in Name]: {
          Schema: Schema
          NameParsed:        FlagName.Parse<Name, { usedNames: Values<Spec['Parameters']>['NameUnion'], reservedNames: 'help' | 'h' }>
          NameUnion: GetName<FlagName.Parse<Name, { usedNames: Values<Spec['Parameters']>['NameUnion'], reservedNames: 'help' | 'h' }>>
        }
      }
    }>
  settings: (newSettings: Settings.Input<SpecToSchema<Spec>>) => BuilderAfterSettings<Spec>
  parse: (processArguments?: string[]) => SpecToArgs<Spec>
}

interface BuilderAfterSettings<Spec extends SomeSpec> {
  parse: (processArguments?: string[]) => SpecToArgs<Spec>
}

// declare const builder: Builder<{ Parameters: {} }>

// const args = builder
//   .parameter(`a alpha`, z.string())
//   .parameter(`bravo b`, z.number())
//   // .parameter(`b`, z.boolean())
//   // .settings({
//   //   parameters: {
//   //     environment: {

//   //     }
//   //   }
//   // })
//   .parse()

export const initializeViaParameter: Builder<{ Parameters: {} }>['parameter'] = () => {
  type State = {
    settings: Settings.Normalized
    parameterSpecInputs: ParameterSpec.SomeSpecInput
  }
  const state: State = {
    settings: {
      ...Settings.getDefaults(getLowerCaseEnvironment()),
    },
    parameterSpecInputs: {},
  }

  const chain = {
    parameter(name: string, type: ParameterSpec.SomeZodType) {
      state.parameterSpecInputs[name] = type
    },
    settings() {},
    parse() {},
  }

  return chain
}

type SomeSpec = {
  Parameters: {
    [key: string]: {
      NameParsed: FlagName.Types.FlagNames
      NameUnion: string
      Schema: ParameterSpec.SomeZodType
    }
  }
}

// TODO move to types lib
type GetCanonicalName<Names extends FlagName.Types.FlagNames> = Names['long'] extends string
  ? Names['long']
  : Names['short'] extends string
  ? Names['short']
  : never

// TODO move to types lib
// prettier-ignore
type GetName<Names extends FlagName.Types.SomeParseResult> = Names extends FlagName.Types.FlagNames
  ? (
      | (Names['long'] extends undefined ? never : Names['long'])
      | (Names['short'] extends undefined ? never : Names['short'])
      | Names['aliases']['long'][number]
      | Names['aliases']['short'][number]
    )
  : ''

type Values<T> = T[keyof T]

type SpecToArgs<Spec extends SomeSpec> = Any.Compute<{
  [K in keyof Spec['Parameters'] & string as GetCanonicalName<Spec['Parameters'][K]['NameParsed']>]: z.infer<
    Spec['Parameters'][K]['Schema']
  >
}>

type SpecToSchema<Spec extends SomeSpec> = {
  [K in keyof Spec['Parameters'] & string as GetCanonicalName<
    Spec['Parameters'][K]['NameParsed']
  >]: Spec['Parameters'][K]['Schema']
}

export const initializeViaParameters = <Schema extends ParameterSpec.SomeSpecInput>(
  schema: Schema
): Definition<Schema> => {
  const settings = {
    ...Settings.getDefaults(getLowerCaseEnvironment()),
  }

  const chain = {
    settings: (newSettings) => {
      Settings.change(settings, newSettings)
      return chain
    },
    parse: (inputs) => {
      const lineInputs = inputs?.line ?? process.argv.slice(2)
      const environmentInputs = inputs?.environment
        ? lowerCaseObjectKeys(inputs.environment)
        : getLowerCaseEnvironment()
      const specs = ParameterSpec.parse(schema, settings)
      // eslint-disable-next-line
      const result = Input.parse(specs, lineInputs, environmentInputs)
      // console.log({ result })
      const requiredParamsMissing = specs
        .filter((_) => !_.optional)
        .filter((_) => result.args[_.name.canonical] === undefined)

      // eslint-disable-next-line
      // @ts-expect-error
      const askedForHelp = `help` in result.args && result.args.help === true

      if (result.errors.length > 0 && !askedForHelp) {
        const errors =
          `Cannot run command, you made some mistakes:\n\n` +
          result.errors.map((_) => _.message).join(`\nX `) +
          `\n\nHere are the docs for this command:\n`
        process.stdout.write(errors + `\n`)
        process.stdout.write(Help.render(specs, settings) + `\n`)
        process.exit(1)
        return // When testing we will reach this case
      }

      if (
        (settings.help && askedForHelp) ||
        (settings.helpOnNoArguments && requiredParamsMissing.length > 0)
      ) {
        process.stdout.write(Help.render(specs, settings) + `\n`)
        process.exit(0)
        return // When testing we will reach this case
      }

      return result.args
    },
    schema,
  } as Definition<Schema>
  return chain
}
