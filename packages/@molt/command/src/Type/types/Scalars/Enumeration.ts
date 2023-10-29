import type { Type } from '../../helpers.js'
import { runtimeIgnore, TypeSymbol } from '../../helpers.js'
import { Either } from 'effect'

export interface Enumeration<$Members extends Member[] = Member[]> extends Type<$Members[number]> {
  _tag: 'TypeEnum'
  members: $Members
}
type Member = number | string

export const enumeration = <$Members extends Member[]>(
  members: $Members,
  description?: string,
): Enumeration<$Members> => {
  return {
    _tag: `TypeEnum`,
    members,
    description: description ?? null,
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    validate: (value) => {
      return members.includes(value as any)
        ? Either.right(value as (typeof members)[number])
        : Either.left({ value, errors: [`Value is not a member of the enum.`] })
    },
  }
}
