import type { KeyPress } from '../KeyPress/index.js'
import { Text } from '../Text/index.js'
import ansiEscapes from 'ansi-escapes'
import { Effect } from 'effect'
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
    keyPressMatchSpec.name === undefined
    || (keyPressMatchSpec.name.includes(event.name)
      && (keyPressMatchSpec.shift === undefined || keyPressMatchSpec.shift === event.shift))
  )
}

export namespace PromptEngine {
  export interface Params<State extends object, Skippable extends boolean = false> {
    initialState: State
    channels: Channels
    /**
     * @defaultValue `false`
     */
    cursor?: boolean
    draw: (state: State) => string
    on?: {
      match?: KeyPressPatternExpression
      run: (state: State, event: KeyPress.KeyPressEvent) => State
    }[]
    skippable?: Skippable
  }

  export const create = <State extends object, Skippable extends boolean>(
    params: Params<State, Skippable>,
  ): Effect.Effect<never, never, Skippable extends true ? null | State : State> =>
    Effect.gen(function*(_) {
      type Ret = Skippable extends true ? null | State : State

      const args = {
        cursor: false,
        skippable: false,
        on: [],
        ...params,
      }
      const matchers = args.on.map(({ match, run }) => {
        return {
          match: (Array.isArray(match) ? match : [match]).map((_) =>
            typeof _ === `string`
              ? {
                name: _,
              }
              : _
          ),
          run,
        }
      })

      const { channels } = args

      const cleanup = () => {
        channels.output(Text.chars.newline)
        if (!args.cursor) channels.output(ansiEscapes.cursorShow)
        process.off(`exit`, cleanup)
      }

      let previousLineCount = 0

      const refresh = (state: State) => {
        channels.output(ansiEscapes.eraseLines(previousLineCount))
        channels.output(ansiEscapes.cursorTo(0))
        const content = args.draw(state)
        previousLineCount = content.split(Text.chars.newline).length
        channels.output(content)
      }

      if (!args.cursor) channels.output(ansiEscapes.cursorHide)
      process.once(`exit`, cleanup)

      const initialState = args.initialState
      refresh(initialState)

      return yield* _(
        pipe(
          channels.readKeyPresses(),
          Stream.takeUntil((value) => !Exit.isExit(value) && args.skippable && value.name === `escape`),
          Stream.takeUntil((value) => !Exit.isExit(value) && value.name === `return`),
          Stream.runFold(initialState as Ret, (state, value): Ret => {
            // todo do higher in the stack
            if (Exit.isExit(value)) {
              process.exit()
            }
            if (state === null) return null as Ret
            if (args.skippable && value.name === `escape`) return null as Ret
            if (value.name === `return`) return state
            const matcher = matchers.find((matcher) =>
              matcher.match.some((match) => isKeyPressMatchPattern(value, match ?? {}))
            )
            const newState = matcher?.run(state, value) ?? state
            refresh(newState)
            return newState as Ret
          }),
          Effect.tap(() => {
            cleanup()
            return Effect.unit
          }),
        ),
      )
    })

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
