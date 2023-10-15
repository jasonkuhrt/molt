import type { Pam } from '../../../Pam/index.js'
import { PromptEngine } from '../../../PromptEngine/PromptEngine.js'
import type { Params } from '../_core.js'
import chalk from 'chalk'
import { Effect } from 'effect'

export const boolean = (params: Params<Pam.Parameter<Pam.Type.Scalar.Boolean>>) =>
  Effect.gen(function* (_) {
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
    const prompt = PromptEngine.create({
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
    })
    const state = yield* _(prompt())
    if (state === null) return undefined
    return state.answer
  })
