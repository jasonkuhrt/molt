import type { Type } from '../../helpers.js'
import { runtimeIgnore, TypeSymbol } from '../../helpers.js'
import { Either } from 'effect'

export interface Literal<$Value extends LiteralValue = LiteralValue> extends Type<$Value> {
  _tag: 'TypeLiteral'
  value: $Value
}

export type LiteralValue = number | string | boolean | undefined

export const literal = <const $Value extends LiteralValue>(
  value: $Value,
  description?: string,
): Literal<$Value> => {
  const literalValue = value
  return {
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    _tag: `TypeLiteral`,
    value,
    description: description ?? null,
    validate: (value) => {
      return value === literalValue
        ? Either.right(value as typeof literalValue)
        : Either.left({ value, errors: [`Value is not equal to literal.`] })
    },
  }
}
