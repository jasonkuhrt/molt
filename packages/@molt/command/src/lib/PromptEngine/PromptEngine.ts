import type { KeyPress } from '../KeyPress/index.js'
import { Text } from '../Text/index.js'
import ansiEscapes from 'ansi-escapes'

interface KeyPressPattern {
  name?: KeyPress.Key
  shift?: boolean
}

type KeyPressPatternExpression =
  | KeyPress.Key
  | KeyPressPatternExpressionObject
  | (KeyPress.Key | KeyPressPatternExpressionObject)[]

interface KeyPressPatternExpressionObject {
  name: KeyPress.Key
  shift?: boolean
}

const isKeyPressMatchPattern = (event: KeyPress.KeyPressEvent, keyPressMatchSpec: KeyPressPattern) => {
  // prettier-ignore
  return (
    keyPressMatchSpec.name === undefined ||
    (keyPressMatchSpec.name.includes(event.name) && (keyPressMatchSpec.shift === undefined || keyPressMatchSpec.shift === event.shift))
  )
}

export namespace PromptEngine {
  export interface Input<State extends object, Skippable extends boolean = false> {
    initialState: State
    channels: Channels
    draw: (state: State) => string
    on?: {
      match?: KeyPressPatternExpression
      run: (state: State, event: KeyPress.KeyPressEvent) => State
    }[]
    skippable?: Skippable
  }

  export const create = <State extends object, Skippable extends boolean>(input: Input<State, Skippable>) => {
    return async (): Promise<Skippable extends true ? null | State : State> => {
      let state = input.initialState
      const matchers = (input?.on ?? []).map(({ match, run }) => {
        return {
          match: (Array.isArray(match) ? match : [match]).map((_) =>
            typeof _ === `string`
              ? {
                  name: _,
                }
              : _,
          ),
          run,
        }
      })

      const { channels } = input
      const cleanup = () => {
        channels.output(Text.chars.newline)
        channels.output(ansiEscapes.cursorShow)
        process.off(`exit`, cleanup)
      }
      let previousLineCount = 0
      const refresh = () => {
        channels.output(ansiEscapes.eraseLines(previousLineCount))
        channels.output(ansiEscapes.cursorTo(0))
        const content = input.draw(state)
        previousLineCount = content.split(Text.chars.newline).length
        channels.output(content)
      }

      channels.output(ansiEscapes.cursorHide)
      process.once(`exit`, cleanup)

      refresh()

      for await (const event of channels.readKeyPresses()) {
        if (input.skippable && event.name === `escape`) {
          cleanup()
          // @ts-expect-error ignoreme
          return null
        }

        if (event.name === `return`) {
          cleanup()
          // @ts-expect-error ignoreme
          return state
        }

        // prettier-ignore
        const matcher = matchers.find((matcher) => matcher.match.some((match) => isKeyPressMatchPattern(event, match ?? {})))
        if (matcher) {
          const newState = matcher.run(state, event)
          state = newState
        }
        refresh()
      }

      // @ts-expect-error ignoreme
      // This is unreachable because the key presses iterator will never end, but TypeScript doesn't know that.
      return null
    }
  }

  export interface Channels {
    output: (value: string) => void
    readLine: () => Promise<string>
    readKeyPresses: <K extends KeyPress.Key>(params?: {
      matching?: K[]
    }) => AsyncIterable<KeyPress.KeyPressEvent<K>>
  }
}
