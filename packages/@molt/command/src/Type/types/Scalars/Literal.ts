export interface Literal<$Value extends Value = Value> {
  _tag: 'TypeLiteral'
  value: $Value
}

export type Value = number | string | boolean

export const literal = <const $Value extends Value>(value: $Value): Literal<$Value> => {
  return { _tag: `TypeLiteral`, value }
}
