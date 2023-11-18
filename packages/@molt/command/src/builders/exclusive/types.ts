import type { HKT } from '../../helpers.js'
import type { ParameterInput } from '../../ParameterInput/index.js'
import type { Type } from '../../Type/index.js'
import type { RawArgInputs } from '../command/types.js'
import type { State } from '../State.js'

export interface ExclusiveParameterConfiguration<$State extends State.Base> {
  type: $State['Type']
}

// prettier-ignore
interface Parameter<$State extends State.Base, Label extends string> {
  <NameExpression extends string, Configuration extends ExclusiveParameterConfiguration<$State>   >(name: State.ValidateNameExpression<$State, NameExpression>, configuration: Configuration): BuilderExclusiveInitial<State.AddExclusiveParameter<$State, Label, NameExpression, Configuration>, Label>
  <NameExpression extends string, $Type       extends $State['Type']>(name: State.ValidateNameExpression<$State, NameExpression>, type: $Type              ): BuilderExclusiveInitial<State.AddExclusiveParameter<$State, Label, NameExpression, {type:HKT.Call<$State['TypeMapper'],$Type>}>, Label>
}

/**
 * This property is present to support internal functions. It is not intended to be used by you.
 */
export type InternalState<$State extends State.Base = State.Base> = {
  /**
   * Used for build time. Type inference functionality.
   */
  typeState: $State
  /**
   * Used for runtime.
   */
  input: ParameterInput.Exclusive<$State>
}

// prettier-ignore
export interface BuilderExclusiveInitial<State extends State.Base, Label extends string> {
  _:         InternalState<State>
  parameter: Parameter<State,Label>
  optional:  () => BuilderExclusiveAfterOptional<State.SetExclusiveOptional<State, Label, true>>
  default:  <Tag extends keyof State['ParametersExclusive'][Label]['Parameters']>(tag: Tag, value: Type.Infer<HKT.Call<State['TypeMapper'], State['ParametersExclusive'][Label]['Parameters'][Tag]['Type']>>) => BuilderExclusiveAfterDefault<State.SetExclusiveOptional<State,Label,false>>
}

export type BuilderExclusiveAfterOptional<State extends State.Base> = {
  _: InternalState<State>
}

export type BuilderExclusiveAfterDefault<State extends State.Base> = {
  _: InternalState<State>
}

export interface BuilderAfterSettings<Spec extends State.Base> {
  parse: (inputs?: RawArgInputs) => State.ToArgs<Spec>
}

export interface SomeParameter<$State extends State.Base> {
  (nameExpression: any, type: $State['Type']): any // eslint-disable-line
  (nameExpression: any, configuration: ExclusiveParameterConfiguration<$State>): any // eslint-disable-line
}

export type SomeBuilderExclusiveInitial<$State extends State.Base> = {
  _: any // eslint-disable-line
  parameter: SomeParameter<$State>
  optional: any // eslint-disable-line
  default: (tag: any, value: any) => any // eslint-disable-line
}

export type SomeBuilderMutuallyExclusiveAfterOptional<$State extends State.Base> =
  BuilderExclusiveAfterOptional<$State>

export type SomeBuilderExclusive<$State extends State.Base> =
  | SomeBuilderExclusiveInitial<$State>
  | SomeBuilderMutuallyExclusiveAfterOptional<$State>