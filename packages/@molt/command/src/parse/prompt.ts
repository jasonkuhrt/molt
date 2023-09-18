import { casesExhausted } from '../helpers.js'
import { Tex } from '../lib/Tex/index_.js'
import { Text } from '../lib/Text/index.js'
import { ParameterSpec } from '../ParameterSpec/index.js'
import { Term } from '../term.js'
import type { ParseProgressPostPrompt, ParseProgressPostPromptAnnotation } from './parse.js'
import ansiEscapes from 'ansi-escapes'
import chalk from 'chalk'
import { stdin, stdout } from 'node:process'
import * as Readline from 'node:readline'

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
        type:
          param._tag === `Basic`
            ? {
                TypeBoolean: `boolean` as const,
                TypeNumber: `number` as const,
                TypeString: `string` as const,
                TypeEnum: `string` as const,
                TypeLiteral: `string` as const,
              }[param.type._tag]
            : `string`, //param._tag === `Basic` && param.type._tag === `TypeBoolean` ? `boolean` : `string`,
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

export type QuestionType = 'boolean' | 'string' | 'number'
export interface Prompter {
  /**
   * Send output to the user.
   */
  say: (text: string) => void
  /**
   * Receive input from the user.
   * TODO remove prompt config from here.
   */
  ask: <T extends QuestionType>(params: {
    prompt: string
    question: string
    type: T
  }) => Promise<T extends boolean ? boolean : T extends number ? number : string>
}

export const createPrompter = (channels: {
  output: (value: string) => void
  readLine: () => Promise<string>
  readKeyPresses: <K extends string>(params: { matching?: K[] }) => AsyncIterable<KeyPressEvent<K>>
}): Prompter => {
  const prompter: Prompter = {
    say: (value: string) => {
      channels.output(value + Text.chars.newline)
    },
    ask: async (params) => {
      channels.output(params.question + Text.chars.newline + params.prompt)
      if (params.type === `boolean`) {
        channels.output(ansiEscapes.cursorHide)
        const no = `${chalk.green(chalk.bold(`no`))} / yes`
        const yes = `no / ${chalk.green(chalk.bold(`yes`))}`
        channels.output(no)
        let answer = false
        for await (const event of channels.readKeyPresses({
          matching: [`left`, `right`, `space`, `return`, `y`, `n`],
        })) {
          if (event.name === `return`) {
            break
          }
          channels.output(ansiEscapes.cursorTo(0))
          channels.output(ansiEscapes.eraseLine)
          channels.output(params.prompt)
          if (event.name === `left` || event.name === `n`) {
            answer = false
          } else if (event.name === `right` || event.name === `y`) {
            answer = true
          } else if (event.name === `space`) {
            answer = !answer
          }
          channels.output(answer ? yes : no)
        }
        channels.output(ansiEscapes.cursorShow)
        return answer as any
      }

      if (params.type === `string`) {
        process.stdin.setRawMode(false) // TODO this should be called within `readKeyPresses` as part of some teardown
        return channels.readLine()
      }

      if (params.type === `number`) {
        process.stdin.setRawMode(false) // TODO this should be called within `readKeyPresses` as part of some teardown
        const answer_ = await channels.readLine()
        const answer = parseFloat(answer_)
        if (isNaN(answer)) return null
        return answer
      }

      casesExhausted(params.type)
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
    script: {
      keyPress: string[]
    }
    history: {
      output: string[]
      answers: string[]
      all: string[]
    }
  } = {
    inputScript: [],
    script: { keyPress: [] },
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
    readKeyPresses: async function* (params) {
      for (const keyPress of state.script.keyPress) {
        if (params.matching?.includes(keyPress as any) ?? true) {
          yield await Promise.resolve(keyPress)
        }
      }
    },
  })
  return {
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
    readKeyPresses: async function* (params) {
      for await (const event of readKeyStrokes()) {
        if (params.matching?.includes(event.name as any) ?? true) {
          // console.log(keyStroke)
          yield event
        }
      }
    },
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

export type KeyPressEvent<Name extends string = string> = {
  name: Name
  sequence: string
  ctrl: boolean
  meta: boolean
  shift: boolean
}

export const readKeyStroke = async (): Promise<KeyPressEvent> => {
  const rl = Readline.promises.createInterface({
    input: stdin,
    output: stdout,
    terminal: false,
  })
  stdin.setRawMode(true)
  Readline.emitKeypressEvents(stdin, rl)

  let listener: (...args: any[]) => void

  return new Promise((resolve) => {
    listener = (k, e) => {
      rl.close()
      stdin.removeListener(`keypress`, listener)
      resolve(e)
    }
    stdin.on(`keypress`, listener)
  })
}

async function* readKeyStrokes(): AsyncGenerator<KeyPressEvent> {
  while (true) {
    const event = await readKeyStroke()
    if (event.name == `c` && event.ctrl == true) {
      process.exit()
    }
    yield event
  }
}
