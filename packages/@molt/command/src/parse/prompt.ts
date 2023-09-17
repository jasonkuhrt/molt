import { Tex } from '../lib/Tex/index_.js'
import { Text } from '../lib/Text/index.js'
import { ParameterSpec } from '../ParameterSpec/index.js'
import { Term } from '../term.js'
import type { ParseProgressPostPrompt, ParseProgressPostPromptAnnotation } from './parse.js'
import * as Readline from 'node:readline/promises'

export interface Prompter {
  /**
   * Send output to the user.
   */
  say: (text: string) => void
  /**
   * Receive input from the user.
   * TODO remove prompt config from here.
   */
  ask: (params: { prompt: string; question: string }) => Promise<string>
}

/**
 * Get args from the user interactively via the console for the given parameters.
 */
// export const prompt = (specs: ParameterSpec.Output[], tty: TTY): Record<string, any> => {
export const prompt = async (
  parseProgress: ParseProgressPostPromptAnnotation,
  prompter: null | Prompter,
): Promise<ParseProgressPostPrompt> => {
  if (prompter === null) return Promise.resolve(parseProgress as ParseProgressPostPrompt)

  const args: Record<string, any> = {}
  const parameterSpecs = Object.entries(parseProgress.basicParameters)
    .filter((_) => _[1].prompt.enabled)
    .map((_) => _[1].spec)
  const indexTotal = parameterSpecs.length
  let indexCurrent = 1
  const gutterWidth = String(indexTotal).length * 2 + 3

  for (const param of parameterSpecs) {
    // prettier-ignore
    const question = Tex({ flow: `horizontal`})
        .block({ padding: { right: 2 }}, `${Term.colors.dim(`${indexCurrent}/${indexTotal}`)}`)
        .block((__) =>
          __.block(Term.colors.positive(param.name.canonical))
            .block((param.description && Term.colors.dim(param.description)) ?? null)
        )
      .render()
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const arg = await prompter.ask({
        question,
        prompt: `${Text.pad(`left`, gutterWidth, Text.chars.space, `❯ `)}`,
      })
      const validationResult = ParameterSpec.validate(param, arg)
      if (validationResult._tag === `Success`) {
        args[param.name.canonical] = validationResult.value
        prompter.say(``) // newline
        indexCurrent++
        break
      } else {
        prompter.say(
          Text.pad(
            `left`,
            gutterWidth,
            ` `,
            Term.colors.alert(`Invalid value: ${validationResult.errors.join(`, `)}`),
          ),
        )
      }
    }
  }

  // todo do not mutate
  const parseProgressPostPrompt = parseProgress as ParseProgressPostPrompt
  for (const [parameterName, arg] of Object.entries(args)) {
    parseProgressPostPrompt.basicParameters[parameterName]!.prompt.arg = arg // eslint-disable-line
  }

  return Promise.resolve(parseProgressPostPrompt)
}

export const createPrompter = (channels: {
  output: (value: string) => void
  readLine: () => Promise<string>
}) => {
  const prompter: Prompter = {
    say: (value: string) => {
      channels.output(value + Text.chars.newline)
    },
    ask: async (params) => {
      channels.output(params.question + Text.chars.newline + params.prompt)
      const answer = await channels.readLine()
      return answer
    },
  }
  return prompter
}

/**
 * A utility for testing prompts. It allows programmatic control of
 * the input and capturing of the output of a prompts session.
 */
export const createMemoryPrompter = () => {
  const state: {
    inputScript: string[]
    history: {
      output: string[]
      answers: string[]
      all: string[]
    }
  } = {
    inputScript: [],
    history: {
      answers: [],
      output: [],
      all: [],
    },
  }
  const prompter: Prompter = createPrompter({
    output: (value) => {
      state.history.output.push(value)
      state.history.all.push(value)
    },
    readLine: async () => {
      const value = state.inputScript.shift()
      if (value === undefined) {
        throw new Error(`No more values in read script.`)
      }
      state.history.answers.push(value)
      state.history.all.push(value)
      return Promise.resolve(value)
    },
  })
  return {
    // state,
    history: state.history,
    answers: {
      add: (values: string[]) => {
        state.inputScript.push(...values)
      },
      get: () => state.inputScript,
    },
    ...prompter,
  }
}

export type MemoryPrompter = ReturnType<typeof createMemoryPrompter>

export const createStdioPrompter = () => {
  return createPrompter({
    output: (value) => process.stdout.write(value),
    readLine: () => {
      return new Promise((res) => {
        const lineReader = Readline.createInterface({
          input: process.stdin,
        })
        lineReader.once(`line`, (value) => {
          lineReader.close()
          res(value)
        })
      })
    },
  })
}
