import type { Type } from './kinds.js'
import type { Value } from './types.js'

export type Parameter = Parameter.Single

export namespace Parameter {
  export interface Single<T extends Type.Group.Any = Type.Group.Any> {
    _tag: 'Basic'
    name: Name
    type: T
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
