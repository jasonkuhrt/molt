import { createUpdater } from '../../helpers.js'
import { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import { State, type ParameterBuilder } from './types.js'

export const create = () => {
  return create_(State.initial)
}

const create_ = <$State extends State.Base>(
  state: $State,
): ParameterBuilder => {
  const update = createUpdater({ builder: create_, state })
  return PrivateData.set(state, {
    name: update(`name`) as any, // eslint-disable-line
    description: update(`description`) as any, // eslint-disable-line
    type: update('type') as any, // eslint-disable-line
    optional: update(`optionality`, () => ({ _tag: `optional` })) as any, // eslint-disable-line
    // eslint-disable-next-line
    prompt: update<[] | [boolean] | [State.PromptInput]>(
      `prompt`,
      (...args) => {
        return args.length === 0
          ? { enabled: true, when: {} }
          : typeof args[0] === `boolean`
          ? { enabled: args[0], when: {} }
          : { enabled: args[0].enabled ?? true, when: args[0].when }
      },
    ) as any,
    // @ts-expect-error ignore
    // eslint-disable-next-line
    default: update(`optionality`, (value) => ({
      _tag: `default`,
      getValue: () => value,
    })) as any,
  } satisfies PrivateData.Remove<ParameterBuilder>)
}
