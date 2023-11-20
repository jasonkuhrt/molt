import { PromptEngine } from '../../../lib/PromptEngine/PromptEngine.js'
import { Text } from '../../../lib/Text/index.js'
import { Term } from '../../../term.js'
import type { Optionality, Type } from '../../helpers.js'
import { runtimeIgnore, TypeSymbol } from '../../helpers.js'
import chalk from 'chalk'
import { Effect, Either } from 'effect'

export interface Enumeration<$Members extends Member[] = Member[]> extends Type<$Members[number]> {
  _tag: 'TypeEnum'
  members: $Members
}
type Member = number | string

export const enumeration = <$Members extends Member[]>({
  members,
  description,
  optionality,
}: {
  members: $Members
  description?: string
  optionality: Optionality<$Members[number]>
}): Enumeration<$Members> => {
  const type: Enumeration<$Members> = {
    _tag: `TypeEnum`,
    priority: 10,
    members,
    optionality,
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    validate: (value) => {
      if (optionality._tag === `optional` && value === undefined) return Either.right(value)
      return members.includes(value as any)
        ? Either.right(value as (typeof members)[number])
        : Either.left({ value, errors: [`Value is not a member of the enum.`] })
    },
    deserialize: (rawValue) => {
      const isNumberEnum = members.find((_) => typeof _ === `number`)
      if (isNumberEnum) {
        const number = Number(rawValue)
        if (isNaN(number)) return Either.left(new Error(`Value is not a number.`))
        return Either.right(number)
      }
      return Either.right(rawValue)
    },
    display: () => `enum`,
    displayExpanded: () => {
      const separator = Term.colors.accent(` ${Text.chars.pipe} `)
      const lines = members.map((member) => Term.colors.positive(String(member))).join(separator)
      return members.length > 1 ? lines : `${lines} ${Term.colors.dim(`(enum)`)}`
    },
    help: () => type.displayExpanded(),
    prompt: (params) => {
      return Effect.gen(function*(_) {
        interface State {
          active: number
        }
        const initialState: State = {
          active: 0,
        }
        const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
        const prompt = PromptEngine.create({
          channels: params.channels,
          initialState,
          on: [
            {
              match: [`left`, { name: `tab`, shift: true }],
              run: (state) => ({
                active: state.active === 0 ? members.length - 1 : state.active - 1,
              }),
            },
            {
              match: [`right`, { name: `tab`, shift: false }],
              run: (state) => ({
                active: state.active === members.length - 1 ? 0 : state.active + 1,
              }),
            },
          ],
          draw: (state) => {
            return (
              marginLeftSpace
              + params.prompt
              + members
                .map((item, i) => (i === state.active ? `${chalk.green(chalk.bold(item))}` : item))
                .join(chalk.dim(` | `))
            )
          },
        })
        const state = yield* _(prompt)

        if (state === null) return undefined

        const choice = members[state.active]
        // prettier-ignore
        if (!choice) {
          throw new Error(
            `No choice selected. Enumeration must be empty. But enumerations should not be empty. This is a bug.`,
          )
        }
        return choice
      })
    },
  }
  return type
}
