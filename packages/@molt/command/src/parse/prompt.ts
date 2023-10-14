import { CommandParameter } from '../CommandParameter/index.js'
import { casesExhausted } from '../helpers.js'
import { KeyPress } from '../lib/KeyPress/index.js'
import type { Pam } from '../lib/Pam/index.js'
import { PromptEngine } from '../lib/PromptEngine/PromptEngine.js'
import { Tex } from '../lib/Tex/index_.js'
import { Text } from '../lib/Text/index.js'
import { Term } from '../term.js'
import type { ParseProgressPostPrompt, ParseProgressPostPromptAnnotation } from './parse.js'
import chalk from 'chalk'
import { Exit, Stream } from 'effect'
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
          __.block(Term.colors.positive(param.name.canonical) +  `${param.optionality._tag === `required` ? `` : chalk.dim(` optional (press esc to skip)`)}`)
            .block((param.description && Term.colors.dim(param.description)) ?? null)
        )
      .render()
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const arg = await prompter.ask({
        question,
        prompt: `❯ `,
        marginLeft: gutterWidth,
        parameter: param,
      })
      const validationResult = CommandParameter.validate(param, arg)
      if (validationResult._tag === `Right`) {
        args[param.name.canonical] = validationResult.right
        prompter.say(``) // newline
        indexCurrent++
        break
      } else {
        prompter.say(
          Text.pad(
            `left`,
            gutterWidth,
            ` `,
            Term.colors.alert(`Invalid value: ${validationResult.left.errors.join(`, `)}`),
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

export interface Prompter {
  /**
   * Send output to the user.
   */
  say: (text: string) => void
  /**
   * Receive input from the user.
   * TODO remove prompt config from here.
   */
  ask: <T extends Pam.Type>(params: {
    parameter: Pam.Parameter<T>
    prompt: string
    question: string
    marginLeft?: number
  }) => Promise<Pam.TypeToValueMapping<T>>
}

export const createPrompter = (channels: PromptEngine.Channels): Prompter => {
  const prompter: Prompter = {
    say: (value: string) => {
      channels.output(value + Text.chars.newline)
    },
    ask: async (params) => {
      const p = { ...params, channels }
      channels.output(params.question + Text.chars.newline)

      if (p.parameter.type._tag === `TypeLiteral`) {
        throw new Error(`Literals are not supported yet.`)
      }

      if (p.parameter.type._tag === `TypeUnion`) {
        // @ts-expect-error todo
        return Inputs.union(p)
      }

      if (p.parameter.type._tag === `TypeBoolean`) {
        // @ts-expect-error todo
        return Inputs.boolean(p)
      }

      if (p.parameter.type._tag === `TypeString`) {
        // @ts-expect-error todo
        return Inputs.string(p)
      }

      if (p.parameter.type._tag === `TypeNumber`) {
        // @ts-expect-error todo
        return Inputs.number(p)
      }

      if (p.parameter.type._tag === `TypeEnum`) {
        // @ts-expect-error todo
        return Inputs.enumeration(p)
      }

      throw casesExhausted(p.parameter.type)
    },
  }
  return prompter
}

namespace Inputs {
  interface InputParams<parameter extends Pam.Parameter> {
    channels: PromptEngine.Channels
    prompt: string
    marginLeft?: number
    parameter: parameter
  }

  export const union = async (params: InputParams<Pam.Parameter<Pam.Type.Union>>) => {
    interface State {
      active: number
    }
    const initialState: State = {
      active: 0,
    }
    const { parameter } = params
    const state = await PromptEngine.create({
      channels: params.channels,
      initialState,
      on: [
        {
          match: [`left`, { name: `tab`, shift: true }],
          run: (state) => ({
            active: state.active === 0 ? parameter.type.members.length - 1 : state.active - 1,
          }),
        },
        {
          match: [`right`, { name: `tab`, shift: false }],
          run: (state) => ({
            active: state.active === parameter.type.members.length - 1 ? 0 : state.active + 1,
          }),
        },
      ],
      draw: (state) => {
        const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
        // prettier-ignore
        const intro = marginLeftSpace + `Different kinds of answers are accepted.` + Text.chars.newline + marginLeftSpace + `Which kind do you want to give?`
        // prettier-ignore
        const typeNameMapping: Record<Pam.Type['_tag'],string> = {
          TypeBoolean:`boolean`,
          TypeEnum: `enum`,
          TypeLiteral: `literal`,
          TypeNumber: `number`,
          TypeString: `string`,
          TypeUnion: `union`
        }
        const choices =
          marginLeftSpace +
          params.prompt +
          parameter.type.members
            .map((item, i) =>
              i === state.active
                ? `${chalk.green(chalk.bold(typeNameMapping[item.type._tag]))}`
                : typeNameMapping[item.type._tag],
            )
            .join(chalk.dim(` | `))
        return Text.chars.newline + intro + Text.chars.newline + Text.chars.newline + choices
      },
    })()

    if (state === null) return undefined

    const choice = parameter.type.members[state.active]
    // prettier-ignore
    if (!choice) throw new Error(`No choice selected. Enumeration must be empty. But enumerations should not be empty. This is a bug.`)

    return createPrompter(params.channels).ask({
      ...params,
      parameter: {
        ...parameter,
        ...choice,
      },
      question: ``,
    })
  }

  export const boolean = async (params: InputParams<Pam.Parameter<Pam.Type.Scalar.Boolean>>) => {
    interface State {
      answer: boolean
    }
    const initialState: State = {
      answer: false,
    }
    const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
    const pipe = `${chalk.dim(`|`)}`
    const no = `${chalk.green(chalk.bold(`no`))} ${pipe} yes`
    const yes = `no ${pipe} ${chalk.green(chalk.bold(`yes`))}`
    const state = await PromptEngine.create({
      channels: params.channels,
      initialState,
      on: [
        {
          match: [`left`, `n`],
          run: (_state) => ({ answer: false }),
        },
        {
          match: [`right`, `y`],
          run: (_state) => ({ answer: true }),
        },
        {
          match: `tab`,
          run: (state) => ({ answer: !state.answer }),
        },
      ],
      draw: (state) => {
        return marginLeftSpace + params.prompt + (state.answer ? yes : no)
      },
    })()
    if (state === null) return undefined
    return state.answer
  }

  export const enumeration = async (params: InputParams<Pam.Parameter<Pam.Type.Scalar.Enumeration>>) => {
    interface State {
      active: number
    }
    const initialState: State = {
      active: 0,
    }
    const { parameter } = params
    const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
    const state = await PromptEngine.create({
      channels: params.channels,
      initialState,
      on: [
        {
          match: [`left`, { name: `tab`, shift: true }],
          run: (state) => ({
            active: state.active === 0 ? parameter.type.members.length - 1 : state.active - 1,
          }),
        },
        {
          match: [`right`, { name: `tab`, shift: false }],
          run: (state) => ({
            active: state.active === parameter.type.members.length - 1 ? 0 : state.active + 1,
          }),
        },
      ],
      draw: (state) => {
        return (
          marginLeftSpace +
          params.prompt +
          parameter.type.members
            .map((item, i) => (i === state.active ? `${chalk.green(chalk.bold(item))}` : item))
            .join(chalk.dim(` | `))
        )
      },
    })()

    if (state === null) return undefined

    const choice = parameter.type.members[state.active]
    // prettier-ignore
    if (!choice) throw new Error(`No choice selected. Enumeration must be empty. But enumerations should not be empty. This is a bug.`)
    return choice
  }

  export const string = async (params: InputParams<Pam.Parameter<Pam.Type.Scalar.String>>) => {
    interface State {
      value: string
    }
    const initialState: State = { value: `` }
    const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
    const state = await PromptEngine.create({
      channels: params.channels,
      skippable: params.parameter.optionality._tag !== `required`,
      initialState,
      on: [
        {
          run: (state, event) => {
            return {
              value: event.name === `backspace` ? state.value.slice(0, -1) : state.value + event.sequence,
            }
          },
        },
      ],
      draw: (state) => {
        return marginLeftSpace + params.prompt + state.value
      },
    })()
    if (state === null) return undefined
    if (state.value === ``) return undefined
    return state.value
  }

  export const number = async (params: InputParams<Pam.Parameter<Pam.Type.Scalar.Number>>) => {
    interface State {
      value: string
    }
    const initialState: State = { value: `` }
    const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
    const state = await PromptEngine.create({
      channels: params.channels,
      skippable: params.parameter.optionality._tag !== `required`,
      initialState,
      on: [
        {
          run: (state, event) => {
            return {
              value: event.name === `backspace` ? state.value.slice(0, -1) : state.value + event.sequence,
            }
          },
        },
      ],
      draw: (state) => {
        return marginLeftSpace + params.prompt + state.value
      },
    })()
    if (state === null) return undefined
    if (state.value === ``) return undefined
    const valueParsed = parseFloat(state.value)
    if (isNaN(valueParsed)) return null as any // todo remove cast
    return valueParsed
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
    readKeyPresses: (params) =>
      Stream.fromIterable(state.script.keyPress).pipe(
        Stream.filter((event) => {
          return params?.matching?.includes(event.name) ?? true
        }),
      ),
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
    readKeyPresses: (params) =>
      KeyPress.stream().pipe(
        Stream.filter((event) => {
          if (Exit.isExit(event)) return true
          return params?.matching?.includes(event.name) ?? true
        }),
      ),
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
