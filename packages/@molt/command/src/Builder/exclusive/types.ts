import type { ParameterSpec } from '../../ParameterSpec/index.js'
import type { RawArgInputs } from '../root/types.js'
import type { State } from '../State.js'

/**
 * This property is present to support internal functions. It is not intended to be used by you.
 */
export type InternalState<State extends State.Base = State.Base> = {
  /**
   * Used for build time. Type inference functionality.
   */
  typeState: State
  /**
   * Used for runtime.
   */
  input: ParameterSpec.Input.Exclusive
}

// prettier-ignore
export interface BuilderExclusiveInitial<State extends State.Base, Label extends string> {
  _:         InternalState<State>
  parameter: <NameExpression extends string, Type extends ParameterSpec.SomeExclusiveZodType>(name: State.ValidateNameExpression<State, NameExpression>, type: Type) => BuilderExclusiveInitial<State.AddExclusiveParameter<State, Label, NameExpression, Type>, Label>
  optional:  () => BuilderExclusiveAfterOptional<State.SetExclusiveOptional<State, Label>>
}

export type BuilderExclusiveAfterOptional<State extends State.Base> = {
  _: InternalState<State>
}

export interface BuilderAfterSettings<Spec extends State.Base> {
  parse: (inputs?: RawArgInputs) => State.ToArgs<Spec>
}

export type SomeBuilderExclusiveInitial = {
  // eslint-disable-next-line
  _: any
  // eslint-disable-next-line
  parameter: (nameExpression: string, type: ParameterSpec.SomeExclusiveZodType) => any
  // eslint-disable-next-line
  optional: any
}

export type SomeBuilderMutuallyExclusiveAfterOptional = BuilderExclusiveAfterOptional<State.Base>

export type SomeBuilderExclusive = SomeBuilderExclusiveInitial | SomeBuilderMutuallyExclusiveAfterOptional
