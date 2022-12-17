import type { ArgumentValue, SomeBasicZodType, SomeExclusiveZodType, SomeUnionZodType } from './types.js'

export type Input = Input.Basic | Input.Exclusive // | Input.Union

export namespace Input {
  export interface Basic {
    _tag: 'Basic'
    nameExpression: string
    type: SomeBasicZodType
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    optionality:
      | { _tag: 'required' }
      | { _tag: 'optional' }
      | { _tag: 'default'; tag: string; value: ArgumentValue | (() => ArgumentValue) }
    description?: string
    parameters: {
      nameExpression: string
      type: SomeExclusiveZodType
    }[]
  }

  export interface Union {
    _tag: 'Union'
    description?: string
    nameExpression: string
    type: SomeUnionZodType
  }
}
