import type { Type } from './kinds.js'
import type { Value } from './types.js'

export type Parameter = Parameter.Scalar | Parameter.Union

export namespace Parameter {
  export interface Scalar<T extends Type.Group.Scalar = Type.Group.Scalar> {
    _tag: 'Basic'
    name: Name
    type: T
    optionality: Optionality
    description: null | string
  }
  export interface Union {
    _tag: 'Union'
    name: Name
    types: {
      type: Type
      description: null | string
    }[]
    optionality: Optionality
    description: null | string
  }
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
