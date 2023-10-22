export interface Number {
  _tag: 'TypeNumber'
  int?: boolean
  min?: number
  max?: number
  multipleOf?: number
  finite?: boolean
}

// eslint-disable-next-line
export const number = (): Number => {
  return { _tag: `TypeNumber` }
}
