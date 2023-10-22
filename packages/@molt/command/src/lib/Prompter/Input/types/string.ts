import type { Pam } from '../../../Pam/index.js'
import { PromptEngine } from '../../../PromptEngine/PromptEngine.js'
import type { Params } from '../_core.js'
import { Effect } from 'effect'

export const string = (params: Params<Pam.Parameter<Pam.Type.Scalar.String>>) =>
  Effect.gen(function* (_) {
    interface State {
      value: string
    }
    const initialState: State = { value: `` }
    const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
    const prompt = PromptEngine.create({
      channels: params.channels,
      cursor: true,
      skippable: params.parameter.optionality._tag !== `required`,
      initialState,
      on: [
        {
          run: (state, event) => {
            return {
              value: event.name === `backspace` ? state.value.slice(0, -1) : state.value + event.sequence,
            }
          },
        },
      ],
      draw: (state) => {
        return marginLeftSpace + params.prompt + state.value
      },
    })
    const state = yield* _(prompt)
    if (state === null) return undefined
    if (state.value === ``) return undefined
    return state.value
  })
