import ansiEscapes from 'ansi-escapes'
import { Text } from '../Text/index.js'
import { KeyPress } from '../KeyPress/index.js'

interface KeyPressPattern {
  name: KeyPress.Key
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
  return (
    keyPressMatchSpec.name.includes(event.name) &&
    (keyPressMatchSpec.shift === undefined || keyPressMatchSpec.shift === event.shift)
  )
}

export namespace Prompt {
  export interface Params<S> {
    initialState: S
    channels: Channels
    draw: (state: S) => string
    on: {
      match: KeyPressPatternExpression
      run: (state: S) => S
    }[]
  }
  export const create = <S>(params: Params<S>) => {
    return async () => {
      let state = params.initialState
      const matchers = params.on.map(({ match, run }) => {
        return {
          match: (Array.isArray(match) ? match : [match]).map((_) =>
            typeof _ === 'string'
              ? {
                  name: _,
                }
              : _,
          ),
          run,
        }
      })

      const { channels } = params
      const cleanup = () => {
        channels.output(ansiEscapes.cursorShow)
        process.off(`exit`, cleanup)
      }
      const refresh = () => {
        channels.output(ansiEscapes.eraseLine)
        channels.output(ansiEscapes.cursorTo(0))
        channels.output(params.draw(state))
      }

      channels.output(ansiEscapes.cursorHide)
      process.once(`exit`, cleanup)

      refresh()
      for await (const event of channels.readKeyPresses()) {
        if (event.name === `return`) {
          break
        }
        const matcher = matchers.find((matcher) =>
          matcher.match.some((match) => isKeyPressMatchPattern(event, match)),
        )
        if (matcher) {
          const newState = matcher.run(state)
          state = newState
        }
        refresh()
      }
      channels.output(Text.chars.newline)
      channels.output(ansiEscapes.cursorShow)
      cleanup()
      return state
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
