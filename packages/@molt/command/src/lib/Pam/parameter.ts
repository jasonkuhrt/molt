import type { Type } from './kinds.js'
import type { Value } from './types.js'

export interface Parameter<T extends Type = Type> {
  _tag: 'Basic'
  name: Name
  type: T
  optionality: Optionality
  description: null | string
}

// prettier-ignore
export type Optionality = 
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default', getValue: () => Value }

export interface Name {
  canonical: string
  aliases: {
    short: string[]
    long: string[]
  }
  short: null | string
  long: null | string
}
