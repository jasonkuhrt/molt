export interface Boolean {
  _tag: 'TypeBoolean'
  description: string | null
}

// eslint-disable-next-line
export const boolean = (description?: string): Boolean => {
  return {
    _tag: `TypeBoolean`,
    description: description ?? null,
  }
}
