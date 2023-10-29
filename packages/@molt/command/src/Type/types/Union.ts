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
    validate: (value) => {
      const result = members.find((member) => member.validate(value)._tag === `Right`)
      if (!result) {
        return Either.left({ value, errors: [`Value does not fit any member of the union.`] })
      }
      return Either.right(result)
    },
  }
}
