import { Tex } from '../../lib/Tex/index.js'
import { Text } from '../../lib/Text/index.js'
import { Term } from '../../term.js'
import { runtimeIgnore, type Type, TypeSymbol } from '../helpers.js'
import { Either } from 'effect'

export interface Union<Members extends readonly Member[] = Member[]> extends Type<Members[number]> {
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
  }
}
