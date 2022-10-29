import type { FlagSpecExpressionParseResultToPropertyName } from '../helpers.js'
import type { Input } from '../Input/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { Settings } from '../Settings/index.js'
import type { FlagName } from '@molt/types'
import type { Any } from 'ts-toolbelt'
import type { z } from 'zod'

export type RawInputs = {
  line?: Input.Line.RawInputs
  environment?: Input.Environment.RawInputs
}

// prettier-ignore
type ParametersToArguments<ParametersSchema extends z.ZodRawShape> = Any.Compute<{
  [FlagSpecExpression in keyof ParametersSchema as FlagSpecExpressionParseResultToPropertyName<FlagName.Parse<FlagSpecExpression & string>>]:
    z.infer<ParametersSchema[FlagSpecExpression]>
}>

export interface BuilderParameters<ParametersSchema extends z.ZodRawShape> {
  schema: ParametersSchema
  settings: (newSettings: Settings.Input<ParametersSchema>) => BuilderParameters<ParametersSchema>
  parse: (rawInputs?: RawInputs) => ParametersToArguments<ParametersSchema>
}

// eslint-disable-next-line
namespace Spec {
  export type AddExclusiveParameters<
    Spec extends SomeSpec,
    Label extends string,
    Name extends string,
    Schema extends ParameterSpec.SomeZodType
  > = {
    Parameters: Spec['Parameters']
    ParametersExclusive: Spec['ParametersExclusive'] & {
      [k in Label]: {
        [k in Name]: {
          Schema: Schema
          NameParsed: FlagName.Parse<
            Name,
            { usedNames: Values<Spec['Parameters']>['NameUnion']; reservedNames: 'help' | 'h' }
          >
          NameUnion: GetName<
            FlagName.Parse<
              Name,
              { usedNames: Values<Spec['Parameters']>['NameUnion']; reservedNames: 'help' | 'h' }
            >
          >
        }
      }
    }
  }

  export type AddParameter<
    Spec extends SomeSpec,
    Name extends string,
    Schema extends ParameterSpec.SomeZodType
  > = {
    ParametersExclusive: Spec['ParametersExclusive']
    Parameters: Spec['Parameters'] & {
      [k in Name]: {
        Schema: Schema
        NameParsed: FlagName.Parse<
          Name,
          { usedNames: Values<Spec['Parameters']>['NameUnion']; reservedNames: 'help' | 'h' }
        >
        NameUnion: GetName<
          FlagName.Parse<
            Name,
            { usedNames: Values<Spec['Parameters']>['NameUnion']; reservedNames: 'help' | 'h' }
          >
        >
      }
    }
  }

  // prettier-ignore
  export type ToArgs<Spec extends SomeSpec> =
    Any.Compute<
      {
        [Name in keyof Spec['Parameters'] & string as GetCanonicalName<Spec['Parameters'][Name]['NameParsed']>]:
          z.infer<Spec['Parameters'][Name]['Schema']>
      } &
      {
        [Label in keyof Spec['ParametersExclusive'] & string]: Values<{
            [Name in keyof Spec['ParametersExclusive'][Label]]:
              {
                _tag: GetCanonicalName<Spec['ParametersExclusive'][Label][Name]['NameParsed']>
                value: z.infer<Spec['ParametersExclusive'][Label][Name]['Schema']>
              }
        }>
      }
    >
}

// prettier-ignore
export interface Builder<Spec extends SomeSpec> {
  parameter: <Name extends string, Schema extends ParameterSpec.SomeZodType>(
    name: 
    FlagName.Errors.$Is<FlagName.Parse<Name, { usedNames: Values<Spec['Parameters']>['NameUnion'], reservedNames: 'help' | 'h' }>> extends true
      ?                 FlagName.Parse<Name, { usedNames: Values<Spec['Parameters']>['NameUnion'], reservedNames: 'help' | 'h' }>
      : Name,
    schema: Schema
  ) =>
    Builder<Spec.AddParameter<Spec,Name,Schema>>
  parametersExclusive: <Label extends string, BuilderReturned extends SomeBuilderExclusiveParameters>(label: Label, mutuallyExclusiveParametersDefiner: (builder: BuilderExclusiveParameters<Spec, Label>) => BuilderReturned) => Builder<BuilderReturned['_']>
  settings: (newSettings: Settings.Input<SpecToSchema<Spec>>) => BuilderAfterSettings<Spec>
  parse: (inputs?: RawInputs) => Spec.ToArgs<Spec>
}

type SomeBuilderExclusiveParameters =
  | BuilderExclusiveParameters<SomeSpec, string>
  | BuilderMutuallyExclusiveParameterAfterOptional<SomeSpec>

export interface BuilderExclusiveParameters<Spec extends SomeSpec, Label extends string> {
  _: Spec
  parameter: <Name extends string, Schema extends ParameterSpec.SomeZodType>(
    name: FlagName.Errors.$Is<
      FlagName.Parse<
        Name,
        { usedNames: Values<Spec['Parameters']>['NameUnion']; reservedNames: 'help' | 'h' }
      >
    > extends true
      ? FlagName.Parse<
          Name,
          { usedNames: Values<Spec['Parameters']>['NameUnion']; reservedNames: 'help' | 'h' }
        >
      : Name,
    schema: Schema
  ) => BuilderExclusiveParameters<Spec.AddExclusiveParameters<Spec, Label, Name, Schema>, Label>
  optional: () => BuilderMutuallyExclusiveParameterAfterOptional<Spec>
}

export type BuilderMutuallyExclusiveParameterAfterOptional<Spec extends SomeSpec> = {
  _: Spec
}

export interface BuilderAfterSettings<Spec extends SomeSpec> {
  parse: (inputs?: RawInputs) => Spec.ToArgs<Spec>
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

type SomeSpec = {
  ParametersExclusive: {
    [key: string]: {
      [key: string]: {
        NameParsed: FlagName.Types.FlagNames
        NameUnion: string
        Schema: ParameterSpec.SomeZodType
      }
    }
  }
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

type SpecToSchema<Spec extends SomeSpec> = {
  [K in keyof Spec['Parameters'] & string as GetCanonicalName<
    Spec['Parameters'][K]['NameParsed']
  >]: Spec['Parameters'][K]['Schema']
}
export type State = {
  settings: Settings.Normalized
  parameterSpecInputs: ParameterSpec.SomeSpecInput
}

export type SomeArgsNormalized = Record<string, unknown>
