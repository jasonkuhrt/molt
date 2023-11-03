import { PromptEngine } from '../../lib/PromptEngine/PromptEngine.js'
import { Tex } from '../../lib/Tex/index.js'
import { Text } from '../../lib/Text/index.js'
import { Term } from '../../term.js'
import { runtimeIgnore, type Type, TypeSymbol } from '../helpers.js'
import chalk from 'chalk'
import { Effect, Either } from 'effect'

export interface Union<Members extends readonly Member[] = Member[]>
  extends Type<Members[number][TypeSymbol]> {
  _tag: 'TypeUnion'
  members: Members
}

export type Member = Type<any>

export const union = <$Members extends Member[]>(
  members: $Members,
  description?: string,
): Union<$Members> => {
  return {
    _tag: `TypeUnion`,
    members,
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    deserialize: (serializedValue) => {
      /**
       * For a union we infer the value to be the type of the first variant type that matches.
       * This means that variant order matters since there are sub/super type relationships.
       * For example a number is a subset of string type. If there is a string and number variant
       * we should first check if the value could be a number, than a string.
       */
      // const variantOrder: Type.Type['_tag'][] = [`TypeNumber`, `TypeBoolean`, `TypeString`, `TypeEnum`, `TypeUnion`]
      return (
        members
          // .sort((a, b) => variantOrder.indexOf(a._tag) - variantOrder.indexOf(b._tag))
          .map((m) => m.deserialize(serializedValue))
          .find((m) => Either.isRight(m)) ?? Either.left(new Error(`No variant matched.`))
      )
    },
    help: () => {
      const isExpandedMode = false
      const unionMemberIcon = Term.colors.accent(`◒`)
      const isOneOrMoreMembersWithDescription = members.some((_) => _.description !== null)
      const isExpandedModeViaForceSetting = isExpandedMode && !isOneOrMoreMembersWithDescription
      if (isExpandedMode) {
        const types = members.flatMap((m) => {
          return Tex.block(
            {
              padding: { bottomBetween: isExpandedModeViaForceSetting ? 0 : 1 },
              border: {
                left: (index) =>
                  `${index === 0 ? unionMemberIcon : Term.colors.dim(Text.chars.borders.vertical)} `,
              },
            },
            (__) => __.block(m.help()).block(m.description),
          )
        })
        return Tex.block((__) =>
          __.block(Term.colors.dim(Text.chars.borders.leftTop + Text.chars.borders.horizontal + `union`))
            .block(
              {
                padding: { bottom: 1 },
                border: { left: `${Term.colors.dim(Text.chars.borders.vertical)} ` },
              },
              description ?? null,
            )
            .block(types)
            .block(Term.colors.dim(Text.chars.borders.leftBottom + Text.chars.borders.horizontal)),
        ) as Tex.Block
      } else {
        const membersRendered = members.map((m) => m.help()).join(` | `)
        return Tex.block(($) => $.block(membersRendered).block(description ?? null)) as Tex.Block
      }
    },
    validate: (value) => {
      const result = members.find((member) => member.validate(value)._tag === `Right`)
      if (!result) {
        return Either.left({ value, errors: [`Value does not fit any member of the union.`] })
      }
      return Either.right(result)
    },
    prompt: (params) =>
      Effect.gen(function* (_) {
        interface State {
          active: number
        }
        const initialState: State = {
          active: 0,
        }
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
            const marginLeftSpace = ` `.repeat(params.marginLeft ?? 0)
            // prettier-ignore
            const intro = marginLeftSpace + `Different kinds of answers are accepted.` + Text.chars.newline + marginLeftSpace + `Which kind do you want to give?`
            // prettier-ignore

            const choices =
              marginLeftSpace +
              params.prompt +
              members
                .map((item, i) =>
                  i === state.active
                    ? `${chalk.green(chalk.bold(item._tag))}`
                    : item._tag,
                )
                .join(chalk.dim(` | `))
            return Text.chars.newline + intro + Text.chars.newline + Text.chars.newline + choices
          },
        })

        const state = yield* _(prompt)

        if (state === null) return undefined

        const choice = members[state.active]
        // prettier-ignore
        if (!choice) throw new Error(`No choice selected. Enumeration must be empty. But enumerations should not be empty. This is a bug.`)

        const res = (yield* _(choice.prompt(params))) as $Members[number]
        return res
      }),
  }
}
