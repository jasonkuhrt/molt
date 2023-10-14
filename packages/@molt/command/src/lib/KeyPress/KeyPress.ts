import { Effect } from 'effect'
import { stdin, stdout } from 'node:process'
import * as Readline from 'node:readline'

export type Key =
  | 'up'
  | 'left'
  | 'down'
  | 'right'
  | 'tab'
  | 'return'
  | 'escape'
  | 'backspace'
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

export interface KeyPressEvent<Name extends Key = Key> {
  name: Name
  ctrl: boolean
  meta: boolean
  shift: boolean
  sequence: string
}

export const get = Effect.async<never, never, KeyPressEvent>((resume) => {
  const rl = Readline.promises.createInterface({
    input: stdin,
    output: stdout,
    terminal: false,
  })
  const originalIsRawState = stdin.isRaw
  if (!stdin.isRaw) {
    stdin.setRawMode(true)
  }
  Readline.emitKeypressEvents(stdin, rl)
  const listener = (_key: string, event: KeyPressEvent) => {
    rl.close()
    stdin.removeListener(`keypress`, listener)
    if (!originalIsRawState) {
      process.stdin.setRawMode(false)
    }
    resume(Effect.succeed(event))
  }

  stdin.on(`keypress`, listener)
})

export const watch = (): AsyncIterable<KeyPressEvent> => {
  return {
    [Symbol.asyncIterator]: () => ({
      next: async () => {
        const event = await Effect.runPromise(get)
        if (event.name == `c` && event.ctrl == true) {
          process.exit()
        }
        return {
          value: event,
          done: false,
        }
      },
    }),
  }
}
