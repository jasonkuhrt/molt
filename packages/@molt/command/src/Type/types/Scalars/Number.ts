export interface Number extends Refinements {
  _tag: 'TypeNumber'
}

interface Refinements {
  int?: boolean
  min?: number
  max?: number
  multipleOf?: number
  finite?: boolean
}

// eslint-disable-next-line
export const number = (refinements?: Refinements): Number => {
  return { _tag: `TypeNumber`, ...refinements }
}
