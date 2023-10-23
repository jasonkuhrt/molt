import type { Type } from '../../../Type/index.js'
import type { Pam } from '../../Pam/index.js'
import type { PromptEngine } from '../../PromptEngine/PromptEngine.js'
import { Text } from '../../Text/index.js'
import { inputForParameter } from '../Input/_core.js'
import type { Effect } from 'effect'

export interface Prompter {
  /**
   * Send output to the user.
   */
  say: (text: string) => void
  /**
   * Receive input from the user.
   * TODO remove prompt config from here.
   */
  ask: <T extends Type.Type>(params: {
    parameter: Pam.Parameter<T>
    prompt: string
    question: string
    marginLeft?: number
  }) => Effect.Effect<never, never, Type.Infer<T>>
}

export const create = (channels: PromptEngine.Channels): Prompter => {
  return {
    say: (value: string) => {
      channels.output(value + Text.chars.newline)
    },
    ask: (params) => {
      const args = { ...params, channels }
      channels.output(params.question + Text.chars.newline)
      return inputForParameter(args)
    },
  }
}
