export interface Literal<$Value extends LiteralValue = LiteralValue> {
  _tag: 'TypeLiteral'
  value: $Value
}

export type LiteralValue = number | string | boolean | undefined

export const literal = <const $Value extends LiteralValue>(value: $Value): Literal<$Value> => {
  return { _tag: `TypeLiteral`, value }
}
