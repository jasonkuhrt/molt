import { ParameterSpec } from '../../ParameterSpec/index.js'
import type { InternalState, SomeBuilderExclusiveInitial } from './types.js'

export const create = (): SomeBuilderExclusiveInitial => {
  const _: InternalState = {
    input: ParameterSpec.Input.Exclusive.create({
      optional: false,
      values: [],
    }),
    typeState: undefined as any, // eslint-disable-line
  }

  const chain: SomeBuilderExclusiveInitial = {
    parameter: (nameExpression, type) => {
      _.input.values.push({ nameExpression, type })
      return chain as any // eslint-disable-line
    },
    optional: () => {
      _.input.optional = true
      return chain
    },
    _,
  }

  return chain
}
