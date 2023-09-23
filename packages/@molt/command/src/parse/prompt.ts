import { CommandParameter } from '../CommandParameter/index.js'
import { casesExhausted } from '../helpers.js'
import { KeyPress } from '../lib/KeyPress/index.js'
import type { Pam } from '../lib/Pam/index.js'
import { Tex } from '../lib/Tex/index_.js'
import { Text } from '../lib/Text/index.js'
import { Term } from '../term.js'
import type { ParseProgressPostPrompt, ParseProgressPostPromptAnnotation } from './parse.js'
import ansiEscapes from 'ansi-escapes'
import chalk from 'chalk'
import * as Readline from 'node:readline'

/**
 * Get args from the user interactively via the console for the given parameters.
 */
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
        parameter: param,
      })
      const validationResult = CommandParameter.validate(param, arg)
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

export type QuestionType = 'boolean' | 'string' | 'number' | 'enumeration'

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
    parameter: Pam.Parameter
    // type: T
  }) => Promise<T extends boolean ? boolean : T extends number ? number : string>
}

interface Channels {
  output: (value: string) => void
  readLine: () => Promise<string>
  readKeyPresses: <K extends string>(params: { matching?: K[] }) => AsyncIterable<KeyPress.KeyPressEvent<K>>
}

export const createPrompter = (channels: Channels): Prompter => {
  const prompter: Prompter = {
    say: (value: string) => {
      channels.output(value + Text.chars.newline)
    },
    ask: async (params) => {
      const { prompt, parameter: parameter_ } = params
      channels.output(params.question + Text.chars.newline)

      const type = parameter_.type

      if (type._tag === `TypeUnion`) {
        throw new Error(`Unions are not supported yet.`)
      }

      if (type._tag === `TypeLiteral`) {
        throw new Error(`Literals are not supported yet.`)
      }

      if (type._tag === `TypeBoolean`) {
        const parameter = { ...parameter_, type }
        return Inputs.boolean({ channels, prompt, parameter: parameter })
      }

      if (type._tag === `TypeString`) {
        const parameter = { ...parameter_, type }
        return Inputs.string({ channels, prompt, parameter })
      }

      if (type._tag === `TypeNumber`) {
        const parameter = { ...parameter_, type }
        return Inputs.number({ channels, prompt, parameter })
      }

      if (type._tag === `TypeEnum`) {
        const parameter = { ...parameter_, type }
        return Inputs.enumeration({ channels, prompt, parameter })
      }

      casesExhausted(type)
    },
  }
  return prompter
}

namespace Inputs {
  interface InputParams<parameter extends Pam.Parameter> {
    channels: Channels
    prompt: string
    parameter: parameter
  }

  export const boolean = async (params: InputParams<Pam.Parameter.Single<Pam.Type.Scalar.Boolean>>) => {
    const { channels } = params
    const pipe = `${chalk.dim(`|`)}`
    let answer = false
    const cleanup = () => {
      channels.output(ansiEscapes.cursorShow)
      process.off(`exit`, cleanup)
    }
    const refresh = () => {
      channels.output(ansiEscapes.eraseLine)
      channels.output(ansiEscapes.cursorTo(0))
      channels.output(params.prompt)
      const no = `${chalk.green(chalk.bold(`no`))} ${pipe} yes`
      const yes = `no ${pipe} ${chalk.green(chalk.bold(`yes`))}`
      channels.output(answer ? yes : no)
    }

    channels.output(ansiEscapes.cursorHide)
    process.once(`exit`, cleanup)

    refresh()
    for await (const event of channels.readKeyPresses({
      matching: [`left`, `right`, `tab`, `return`, `y`, `n`],
    })) {
      if (event.name === `return`) {
        break
      }
      if (event.name === `left` || event.name === `n`) {
        answer = false
      } else if (event.name === `right` || event.name === `y`) {
        answer = true
      } else if (event.name === `tab`) {
        answer = !answer
      }
      refresh()
    }
    channels.output(Text.chars.newline)
    channels.output(ansiEscapes.cursorShow)
    cleanup()
    return answer as any
  }

  export const string = async (params: InputParams<Pam.Parameter.Single<Pam.Type.Scalar.String>>) => {
    params.channels.output(params.prompt)
    return params.channels.readLine()
  }

  export const enumeration = async (
    params: InputParams<Pam.Parameter.Single<Pam.Type.Scalar.Enumeration>>,
  ) => {
    const { channels, parameter } = params
    let active = 0
    const render = () =>
      parameter.type.members
        .map((item, i) => (i === active ? `${chalk.green(chalk.bold(item))}` : item))
        .join(chalk.dim(` | `))
    const refresh = () => {
      channels.output(ansiEscapes.eraseLine)
      channels.output(ansiEscapes.cursorTo(0))
      channels.output(params.prompt)
      channels.output(render())
    }
    const cleanup = () => {
      channels.output(ansiEscapes.cursorShow)
      process.off(`exit`, cleanup)
    }

    channels.output(ansiEscapes.cursorHide)
    process.once(`exit`, cleanup)

    refresh()
    for await (const event of channels.readKeyPresses({
      matching: [`left`, `right`, `tab`, `return`],
    })) {
      if (event.name === `return`) {
        break
      }
      if (event.name === `left` || (event.name === `tab` && event.shift)) {
        active = active === 0 ? parameter.type.members.length - 1 : active - 1
      } else if (event.name === `right` || (event.name === `tab` && !event.shift)) {
        active = active === parameter.type.members.length - 1 ? 0 : active + 1
      }
      refresh()
    }
    const choice = parameter.type.members[active]
    if (!choice)
      throw new Error(
        `No choice selected. Enumeration must be empty. But enumerations should not be empty. This is a bug.`,
      )
    channels.output(Text.chars.newline)
    cleanup()
    return choice
  }

  export const number = async (params: InputParams<Pam.Parameter.Single<Pam.Type.Scalar.Number>>) => {
    params.channels.output(params.prompt)
    const answer_ = await params.channels.readLine()
    const answer = parseFloat(answer_)
    if (isNaN(answer)) return null
    return answer
  }
}

/**
 * A utility for testing prompts. It allows programmatic control of
 * the input and capturing of the output of a prompts session.
 */
export const createMemoryPrompter = () => {
  const state: {
    inputScript: string[]
    script: {
      keyPress: KeyPress.KeyPressEvent<any>[]
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
        if (params.matching?.includes(keyPress.name) ?? true) {
          yield await Promise.resolve(keyPress)
        }
      }
    },
  })
  return {
    history: state.history,
    script: state.script,
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
      for await (const event of KeyPress.watch()) {
        if (params.matching?.includes(event.name as any) ?? true) {
          yield event as KeyPress.KeyPressEvent<any>
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
