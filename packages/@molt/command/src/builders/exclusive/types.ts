import type { CommandParameter } from '../../CommandParameter/index.js'
import type { HKT } from '../../helpers.js'
import type { Type } from '../../Type/index.js'
import type { RawArgInputs } from '../root/types.js'
import type { State } from '../State.js'

export interface ExclusiveParameterConfiguration<$State extends State.Base> {
  schema: $State['Schema']
}

// prettier-ignore
interface Parameter<$State extends State.Base, Label extends string> {
  <NameExpression extends string, Configuration extends ExclusiveParameterConfiguration<$State>   >(name: State.ValidateNameExpression<$State, NameExpression>, configuration: Configuration): BuilderExclusiveInitial<State.AddExclusiveParameter<$State, Label, NameExpression, Configuration>, Label>
  <NameExpression extends string, $Schema       extends $State['Schema']>(name: State.ValidateNameExpression<$State, NameExpression>, schema: $Schema              ): BuilderExclusiveInitial<State.AddExclusiveParameter<$State, Label, NameExpression, {schema:$Schema,type:HKT.Call<$State['SchemaMapper'],$Schema>}>, Label>
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
  input: CommandParameter.Input.Exclusive<$State>
}

// prettier-ignore
export interface BuilderExclusiveInitial<State extends State.Base, Label extends string> {
  _:         InternalState<State>
  parameter: Parameter<State,Label>
  optional:  () => BuilderExclusiveAfterOptional<State.SetExclusiveOptional<State, Label, true>>
  default:  <Tag extends keyof State['ParametersExclusive'][Label]['Parameters']>(tag: Tag, value: Type.Infer<HKT.Call<State['SchemaMapper'], State['ParametersExclusive'][Label]['Parameters'][Tag]['Schema']>>) => BuilderExclusiveAfterDefault<State.SetExclusiveOptional<State,Label,false>>
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
  (nameExpression: any, type: $State['Schema']): any // eslint-disable-line
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
