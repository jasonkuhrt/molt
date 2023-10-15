import type { KeyPress } from '../KeyPress/index.js'
import { Text } from '../Text/index.js'
import ansiEscapes from 'ansi-escapes'
import type { Effect } from 'effect'
import { Exit, pipe, Stream } from 'effect'

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
    return (): Effect.Effect<never, never, Skippable extends true ? null | State : State> => {
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

      const refresh = (state: State) => {
        channels.output(ansiEscapes.eraseLines(previousLineCount))
        channels.output(ansiEscapes.cursorTo(0))
        const content = input.draw(state)
        previousLineCount = content.split(Text.chars.newline).length
        channels.output(content)
      }

      channels.output(ansiEscapes.cursorHide)
      process.once(`exit`, cleanup)

      const initialState = input.initialState
      refresh(initialState)

      const result = pipe(
        channels.readKeyPresses(),
        Stream.takeUntil(
          (value) => !Exit.isExit(value) && input.skippable === true && value.name === `escape`,
        ),
        Stream.takeUntil((value) => !Exit.isExit(value) && value.name === `return`),
        Stream.runFold(initialState as State | null, (state, value): State | null => {
          // todo do higher in the stack
          if (Exit.isExit(value)) {
            process.exit()
          }
          if (state === null) return null
          if (input.skippable && value.name === `escape`) return null
          if (value.name === `return`) return state
          const matcher = matchers.find((matcher) =>
            matcher.match.some((match) => isKeyPressMatchPattern(value, match ?? {})),
          )
          const newState = matcher?.run(state, value) ?? state
          refresh(newState)
          return newState
        }),
      )

      cleanup()

      return result as Effect.Effect<never, never, Skippable extends true ? null | State : State>
    }
  }

  export interface Channels {
    output: (value: string) => void
    readLine: () => Effect.Effect<never, never, string>
    readKeyPresses: <K extends KeyPress.Key>(
      params?: ReadKeyPressesParams<K>,
    ) => Stream.Stream<never, never, Exit.Exit<never, void> | KeyPress.KeyPressEvent<K>>
  }
  export interface ReadKeyPressesParams<K extends string> {
    matching?: K[]
  }
}
