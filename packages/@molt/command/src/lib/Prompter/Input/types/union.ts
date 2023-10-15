import type { Pam } from '../../../Pam/index.js'
import { PromptEngine } from '../../../PromptEngine/PromptEngine.js'
import { Text } from '../../../Text/index.js'
import { create } from '../../Constructors/_core.js'
import type { Params } from '../_core.js'
import chalk from 'chalk'
import { Effect } from 'effect'

export const union = (params: Params<Pam.Parameter<Pam.Type.Union>>) =>
  Effect.gen(function* (_) {
    interface State {
      active: number
    }
    const initialState: State = {
      active: 0,
    }
    const { parameter } = params
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
    })

    const state = yield* _(prompt())

    if (state === null) return undefined

    const choice = parameter.type.members[state.active]
    // prettier-ignore
    if (!choice) throw new Error(`No choice selected. Enumeration must be empty. But enumerations should not be empty. This is a bug.`)

    return yield* _(
      create(params.channels).ask({
        ...params,
        parameter: {
          ...parameter,
          ...choice,
        },
        question: ``,
      }),
    )
  })
