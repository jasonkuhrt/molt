import type { Pam } from '../../../Pam/index.js'
import { PromptEngine } from '../../../PromptEngine/PromptEngine.js'
import type { Params } from '../_core.js'
import chalk from 'chalk'
import { Effect } from 'effect'

export const enumeration = (params: Params<Pam.Parameter<Pam.Type.Scalar.Enumeration>>) =>
  Effect.gen(function* (_) {
    interface State {
      active: number
    }
    const initialState: State = {
      active: 0,
    }
    const { parameter } = params
    const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
    const prompt = PromptEngine.create({
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
    })
    const state = yield* _(prompt())

    if (state === null) return undefined

    const choice = parameter.type.members[state.active]
    // prettier-ignore
    if (!choice) throw new Error(`No choice selected. Enumeration must be empty. But enumerations should not be empty. This is a bug.`)
    return choice
  })
