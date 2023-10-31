import { parseEnvironmentVariableBoolean } from '../../../helpers.js'
import { PromptEngine } from '../../../lib/PromptEngine/PromptEngine.js'
import { Term } from '../../../term.js'
import type { Type } from '../../helpers.js'
import { runtimeIgnore, TypeSymbol } from '../../helpers.js'
import chalk from 'chalk'
import { Effect, Either } from 'effect'

export interface Boolean extends Type<boolean> {
  _tag: 'TypeBoolean'
}

// eslint-disable-next-line
export const boolean = (description?: string): Boolean => {
  return {
    _tag: `TypeBoolean`,
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    // eslint-disable-next-line
    validate: (value: unknown) => {
      return typeof value === `boolean`
        ? Either.right(value)
        : Either.left({ value, errors: [`Value is not a boolean.`] })
    },
    help: () => {
      return Term.colors.positive(`boolean`)
    },
    deserialize: (rawValue) => {
      return parseEnvironmentVariableBoolean(rawValue)
    },
    prompt: (params) => {
      return Effect.gen(function* (_) {
        interface State {
          value: boolean
        }
        const initialState: State = {
          value: false,
        }
        const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
        const pipe = `${chalk.dim(`|`)}`
        const no = `${chalk.green(chalk.bold(`no`))} ${pipe} yes`
        const yes = `no ${pipe} ${chalk.green(chalk.bold(`yes`))}`
        const prompt = PromptEngine.create({
          channels: params.channels,
          initialState,
          on: [
            {
              match: [`left`, `n`],
              run: (_state) => ({ value: false }),
            },
            {
              match: [`right`, `y`],
              run: (_state) => ({ value: true }),
            },
            {
              match: `tab`,
              run: (state) => ({ value: !state.value }),
            },
          ],
          draw: (state) => {
            return marginLeftSpace + params.prompt + (state.value ? yes : no)
          },
        })
        const state = yield* _(prompt)
        if (state === null) return undefined
        return state.value
      })
    },
  }
}
