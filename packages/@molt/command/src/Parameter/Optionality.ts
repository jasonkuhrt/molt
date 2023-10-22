import type { Value } from './helpers.js'

// prettier-ignore
export type Optionality =  OptionalityRequired| OptionalityOptional | OptionalityDefault

export interface OptionalityRequired {
  _tag: 'Required'
}

export interface OptionalityOptional {
  _tag: 'Optional'
}

export interface OptionalityDefault<$Value extends Value = Value> {
  _tag: 'Default'
  value: () => $Value
}
