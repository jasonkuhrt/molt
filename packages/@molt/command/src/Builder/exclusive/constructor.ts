import { ParameterSpec } from '../../ParameterSpec/index.js'
import type { InternalState, SomeBuilderExclusiveInitial } from './types.js'

export const create = (): SomeBuilderExclusiveInitial => {
  const _: InternalState = {
    // @ts-expect-error https://github.com/colinhacks/zod/issues/1628
    input: ParameterSpec.Input.Exclusive.create({
      optional: false,
      default: null,
      values: [],
    }),
    typeState: undefined as any, // eslint-disable-line
  }

  const chain: SomeBuilderExclusiveInitial = {
    parameter: (nameExpression: string, type) => {
      _.input.values.push({ nameExpression, type })
      return chain as any // eslint-disable-line
    },
    optional: () => {
      _.input.optional = true
      return chain
    },
    default: (tag: string, value: unknown) => {
      _.input.default = { tag, value }
      return chain
    },
    _,
  }

  return chain
}
