import type { CommandParameter } from '../../CommandParameter/index.js'
import type { Pam } from '../../lib/Pam/index.js'
import type { InternalState, SomeBuilderExclusiveInitial } from './types.js'

export const create = (): SomeBuilderExclusiveInitial => {
  const _: InternalState = {
    input: {
      _tag: `Exclusive`,
      optionality: { _tag: `required` },
      parameters: [],
    } satisfies CommandParameter.Input.Exclusive,
    typeState: undefined as any, // eslint-disable-line
  }

  const chain: SomeBuilderExclusiveInitial = {
    parameter: (nameExpression: string, schemaOrConfiguration) => {
      const configuration =
        `schema` in schemaOrConfiguration ? schemaOrConfiguration : { schema: schemaOrConfiguration }
      _.input.parameters.push({ nameExpression, type: configuration.schema })
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
