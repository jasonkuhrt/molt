export interface Number extends Refinements {
  _tag: 'TypeNumber'
  description: string | null
}

interface Refinements {
  int?: boolean
  min?: number
  max?: number
  multipleOf?: number
  finite?: boolean
}

// eslint-disable-next-line
export const number = (refinements?: Refinements, description?: string): Number => {
  return {
    _tag: `TypeNumber`,
    ...refinements,
    description: description ?? null,
  }
}
