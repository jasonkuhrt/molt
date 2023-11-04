import { BooleanLookup, casesExhausted } from '../../../helpers.js'
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
  const type: Literal<$Value> = {
    [TypeSymbol]: runtimeIgnore, // eslint-disable-line
    _tag: `TypeLiteral`,
    value,
    description: description ?? null,
    validate: (_value) => {
      return _value === value
        ? Either.right(_value as typeof value)
        : Either.left({ value: _value, errors: [`Value is not equal to literal.`] })
    },
    display: () => {
      return Term.colors.positive(String(value))
    },
    help: () => type.display(),
    prompt: () => {
      throw new Error(`Not implemented`)
    },
    deserialize: (rawValue) => {
      if (typeof value === `string`) return Either.right(rawValue as $Value)
      if (typeof value === `undefined`) {
        if (rawValue !== `undefined`) {
          return Either.left(new Error(`Invalid undefined literal value: ${String(rawValue)}`))
        }
        return Either.right(undefined as $Value)
      }
      if (typeof value === `number`) {
        const number = Number(rawValue)
        if (isNaN(number)) {
          return Either.left(new Error(`Invalid number literal value: ${String(rawValue)}`))
        }
        return Either.right(number as $Value)
      }
      if (typeof value === `boolean`) {
        const v = (BooleanLookup as Record<string, boolean>)[rawValue]
        if (!v) {
          return Either.left(new Error(`Invalid boolean literal value: ${String(rawValue)}`))
        }
        return Either.right(v as $Value)
      }
      return casesExhausted(value)
    },
    // todo
    // prompt: (params) => {
    // return Effect.
    // }
  }
  return type
}
