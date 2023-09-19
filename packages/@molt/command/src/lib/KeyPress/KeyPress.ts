import { stdin, stdout } from 'node:process'
import * as Readline from 'node:readline'

export interface KeyPressEvent<Name extends string = string> {
  name: Name
  ctrl: boolean
  meta: boolean
  shift: boolean
  sequence: string
}

export const get = async (): Promise<KeyPressEvent> => {
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

  let listener: (...args: any[]) => void

  return new Promise((resolve) => {
    listener = (k, e) => {
      rl.close()
      stdin.removeListener(`keypress`, listener)
      if (!originalIsRawState) {
        process.stdin.setRawMode(false)
      }
      resolve(e)
    }
    stdin.on(`keypress`, listener)
  })
}

export async function* watch(): AsyncGenerator<KeyPressEvent> {
  while (true) {
    const event = await get()
    if (event.name == `c` && event.ctrl == true) {
      process.exit()
    }
    yield event
  }
}
