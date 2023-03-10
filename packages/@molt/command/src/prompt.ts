import { ParameterSpec } from './ParameterSpec/index.js'

export interface TTY {
  write: (text: string) => void
  read: () => string
}

/**
 * Get args from the user interactively via the console for the given parameters.
 */
export const prompt = (specs: ParameterSpec.Output[], tty: TTY): Record<string, any> => {
  const args: Record<string, any> = {}

  for (const spec of specs) {
    // todo show a pretty prompt
    tty.write(`Please give argument for parameter "${spec.name.canonical}"`)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const arg = tty.read()
      const validationResult = ParameterSpec.validate(spec, arg)
      if (validationResult._tag === `Success`) {
        args[spec.name.canonical] = validationResult.value
        break
      } else {
        tty.write(`Invalid value: ${validationResult.errors.join(`, `)}`)
      }
    }
  }

  return args
}

export const createMockTTY = () => {
  const state: {
    readScript: string[]
    history: {
      writes: string[]
      full: string[]
    }
  } = {
    readScript: [],
    history: {
      writes: [],
      full: [],
    },
  }
  const tty: TTY = {
    write: (value) => {
      state.history.writes.push(value), state.history.full.push(value)
    },
    read: () => {
      const value = state.readScript.shift()
      if (value === undefined) {
        throw new Error(`No more values in read script.`)
      }
      state.history.full.push(value)
      return value
    },
  }
  return {
    state,
    script: {
      reads: (values: string[]) => {
        state.readScript.push(...values)
      },
    },
    interface: tty,
  }
}

export type MockTTY = ReturnType<typeof createMockTTY>
