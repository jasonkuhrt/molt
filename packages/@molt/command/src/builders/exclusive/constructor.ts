import type { Pam } from '../../lib/Pam/index.js'
import type { ParameterInput } from '../../ParameterInput/index.js'
import type { InternalState, SomeBuilderExclusiveInitial } from './types.js'

export const create = (): SomeBuilderExclusiveInitial => {
  const _: InternalState = {
    input: {
      _tag: `Exclusive`,
      optionality: { _tag: `required` },
      parameters: [],
    } satisfies ParameterInput.Exclusive,
    typeState: undefined as any, // eslint-disable-line
  }

  const chain: SomeBuilderExclusiveInitial = {
    parameter: (nameExpression: string, typeOrConfiguration) => {
      const configuration =
        `type` in typeOrConfiguration ? typeOrConfiguration : { type: typeOrConfiguration }
      _.input.parameters.push({ nameExpression, type: configuration.type })
      return chain as any // eslint-disable-line
    },
    optional: () => {
      _.input.optionality = { _tag: `optional` }
      return chain
    },
    default: (tag: string, value: Pam.Value) => {
      _.input.optionality = { _tag: `default`, tag, value }
      return chain
    },
    _,
  }

  return chain
}
