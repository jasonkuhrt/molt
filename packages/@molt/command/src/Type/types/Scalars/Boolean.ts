export interface Boolean {
  _tag: 'TypeBoolean'
}

// eslint-disable-next-line
export const boolean = (): Boolean => {
  return { _tag: `TypeBoolean` }
}
