export interface Literal<$Value extends LiteralValue = LiteralValue> {
  _tag: 'TypeLiteral'
  value: $Value
  description: string | null
}

export type LiteralValue = number | string | boolean | undefined

export const literal = <const $Value extends LiteralValue>(
  value: $Value,
  description?: string,
): Literal<$Value> => {
  return {
    _tag: `TypeLiteral`,
    value,
    description: description ?? null,
  }
}
