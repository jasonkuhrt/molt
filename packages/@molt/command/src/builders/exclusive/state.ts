import type { ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import type { BuilderCommandState } from '../command/state.js'

export type BuilderParameterExclusiveState<
  $State extends BuilderCommandState.Base = BuilderCommandState.Base,
> = {
  /**
   * Used for build time. Type inference functionality.
   */
  typeState: $State
  /**
   * Used for runtime.
   */
  input: ParameterExclusiveInput<$State>
}

export const createState = (label: string): BuilderParameterExclusiveState => {
  return {
    typeState: undefined as any, // eslint-disable-line
    input: {
      label,
      _tag: `Exclusive`,
      optionality: { _tag: `required` },
      parameters: [],
    } satisfies ParameterExclusiveInput,
  }
}
