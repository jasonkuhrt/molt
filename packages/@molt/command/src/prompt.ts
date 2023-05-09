import { Tex } from './lib/Tex/index_.js'
import { Text } from './lib/Text/index.js'
import { ParameterSpec } from './ParameterSpec/index.js'
import { Term } from './term.js'

export interface TTY {
  output: (text: string) => void
  input: (params: { prompt: string }) => string
}

/**
 * Get args from the user interactively via the console for the given parameters.
 */
export const prompt = (specs: ParameterSpec.Output[], tty: TTY): Record<string, any> => {
  const args: Record<string, any> = {}
  const indexTotal = specs.length
  let indexCurrent = 1
  const gutterWidth = String(indexTotal).length * 2 + 3

  for (const spec of specs) {
    // prettier-ignore
    const question = Tex({ flow: `horizontal`})
        .block({ padding: { right: 2 }}, `${Term.colors.dim(`${indexCurrent}/${indexTotal}`)}`)
        .block((__) =>
          __.block(Term.colors.positive(spec.name.canonical))
            .block((spec.description && Term.colors.dim(spec.description)) ?? null)
        )
      .render()
    tty.output(question)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const arg = tty.input({ prompt: `${Text.pad(`left`, gutterWidth, Text.chars.space, `❯ `)}` })
      const validationResult = ParameterSpec.validate(spec, arg)
      if (validationResult._tag === `Success`) {
        args[spec.name.canonical] = validationResult.value
        tty.output(Text.chars.newline)
        indexCurrent++
        break
      } else {
        tty.output(
          Text.pad(
            `left`,
            gutterWidth,
            ` `,
            Term.colors.alert(`Invalid value: ${validationResult.errors.join(`, `)}`)
          )
        )
      }
    }
  }

  return args
}

export const createMockTTY = () => {
  const state: {
    inputScript: string[]
    history: {
      output: string[]
      input: string[]
      all: string[]
    }
  } = {
    inputScript: [],
    history: {
      input: [],
      output: [],
      all: [],
    },
  }
  const tty: TTY = {
    output: (value) => {
      state.history.output.push(value)
      state.history.all.push(value)
    },
    input: () => {
      const value = state.inputScript.shift()
      if (value === undefined) {
        throw new Error(`No more values in read script.`)
      }
      state.history.input.push(value)
      state.history.all.push(value)
      return value
    },
  }
  return {
    // state,
    history: state.history,
    mock: {
      input: {
        add: (values: string[]) => {
          state.inputScript.push(...values)
        },
        get: () => state.inputScript,
      },
    },
    interface: tty,
  }
}

export type MockTTY = ReturnType<typeof createMockTTY>
