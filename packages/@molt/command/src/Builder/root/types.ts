import type { Args } from '../../Args/index.js'
import type { ParameterSpec } from '../../ParameterSpec/index.js'
import type { TTY } from '../../prompt.js'
import type { Settings } from '../../Settings/index.js'
import type {
  BuilderAfterSettings,
  BuilderExclusiveInitial,
  SomeBuilderExclusive,
} from '../exclusive/types.js'
// eslint-disable-next-line
import { State } from '../State.js'

export type Schema = ParameterSpec.SomeBasicType | ParameterSpec.SomeUnionType

export interface ParameterConfiguration {
  schema: Schema
  prompt?: boolean
}

// prettier-ignore
interface Parameter<State extends State.Base = State.BaseEmpty> {
  <NameExpression extends string, Configuration extends ParameterConfiguration          >(name:State.ValidateNameExpression<State,NameExpression>, configuration: Configuration): RootBuilder<State.AddParameter<State,NameExpression,Configuration>>
  <NameExpression extends string, Schema        extends ParameterConfiguration['schema']>(name:State.ValidateNameExpression<State,NameExpression>, schema:Schema               ): RootBuilder<State.AddParameter<State,NameExpression,{schema:Schema}>>
}

export interface SomeParameterConfig<S extends Schema> {
  schema: S
  prompt?: ParameterSpec.Input.Prompt<S>
}

export type SomeParametersConfigSchema = Record<string, ParameterConfiguration['schema']>

// prettier-ignore
export type SomeParametersConfig<S extends Schema> = {
  [parameterNameExpression:string]: SomeParameterConfig<S>
}

// interface A<Foo extends string = string> {
//   foo: Foo
//   bar: `Depends on ${NoInfer<Foo>}`
// }

// declare const c: <A_ extends string>(a: A<A_>) => void
// c({ foo: `beep3`, bar: `Depends on beep3` })

// declare const d: <X extends ParameterSpec.SomeBasicType>(x: SomeParameterConfig<X>) => void
// d({
//   schema: z.string().optional(),
//   prompt: { when: { omitted: { optionality: `optional` } } },
// })

// interface Alpha<Foo extends string> {
//   foo: Foo
//   bar: `Depends on ${NoInfer<Foo>}`
// }

// declare const bravo: <T extends Record<keyof T,  string>>(xs: {[k in keyof T]: Alpha<T[k]>}) => void

// bravo({
//   one: { foo: `1`, bar: `Depends on 1` }, // ok
//   oneX: { foo: `1x`, bar: `Depends on 1x` }, // wrong, should be type error, 1 !== 1x
//   two: { foo: `2`, bar: `Depends on 2` }, // ok
//   twoX: { foo: `2x`, bar: `Depends on 2x` }, // wrong, should be type error, 2 !== 2x
// })

// declare const e: <C extends Record<keyof C, ParameterSpec.SomeBasicParameterType>>(xs: {
//   [k in keyof C]: SomeParameterConfig<C[k]>
// }) => {
//   [k in keyof C]: SomeParameterConfig<C[k]>
// }
// // prettier-ignore
// const x = e({
//   alpha:   { schema: z.string()  },
//   bravo:   { schema: z.number()  },
//   charlie: { schema: z.boolean(), prompt: {when:{omitted:`Not Available. Only when parameter optional or has default.`}} },
//   delta:   { schema: z.boolean().optional(), prompt: {when:{omitted:{optionality:`default`}}} }
// })

// x.charlie.prompt

// prettier-ignore
interface Parameters<State extends State.Base = State.BaseEmpty> {
  <C       extends Record<keyof C, ParameterSpec.SomeBasicParameterType>>       (config: {[k in keyof C]: SomeParameterConfig<C[k]>}):        RootBuilder<State.AddParametersConfig<State,{[k in keyof C]:SomeParameterConfig<C[k]>}>>
  <CSchema extends SomeParametersConfigSchema>                                  (schema:CSchema):                                             RootBuilder<State.AddParametersConfig<State,{[k in keyof CSchema]:{schema:CSchema[k]}}>>
}

// prettier-ignore
export interface RootBuilder<State extends State.Base = State.BaseEmpty> {
  description:         (description:string) => RootBuilder<State>
  parameter:           Parameter<State>
  parameters:          Parameters<State>
  parametersExclusive: <Label extends string, BuilderExclusive extends SomeBuilderExclusive>(label:Label, ExclusiveBuilderContainer: (builder:BuilderExclusiveInitial<State,Label>) => BuilderExclusive) => RootBuilder<BuilderExclusive['_']['typeState']>
  settings:            (newSettings:Settings.Input<State.ToSchema<State>>) => BuilderAfterSettings<State>
  parse:               (inputs?:RawArgInputs) => State.ToArgs<State>
}

export type RawArgInputs = {
  line?: Args.Line.RawInputs
  environment?: Args.Environment.RawInputs
  tty?: TTY
}

export type SomeArgsNormalized = Record<string, unknown>

type NoInfer<T> = [T][T extends unknown ? 0 : never]
