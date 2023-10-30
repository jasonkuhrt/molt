import { Term } from '../../../term.js'
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
  return {
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    _tag: `TypeLiteral`,
    value,
    description: description ?? null,
    validate: (_value) => {
      return _value === value
        ? Either.right(_value as typeof value)
        : Either.left({ value: _value, errors: [`Value is not equal to literal.`] })
    },
    help: () => {
      return Term.colors.positive(String(value))
    },
  }
}
