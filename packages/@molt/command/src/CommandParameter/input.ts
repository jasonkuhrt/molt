import type { EventPatternsInput } from '../eventPatterns.js'
import type { ArgumentValueScalar, SomeBasicType, SomeExclusiveZodType, SomeUnionType } from './types.js'

export type Input = Input.Basic | Input.Exclusive

export namespace Input {
  export type Schema = SomeBasicType | SomeUnionType

  export type Prompt<S extends Schema> =
    | null
    | boolean
    | {
        enabled?: boolean
        when?: EventPatternsInput<S>
      }

  export interface Basic {
    _tag: 'Basic'
    nameExpression: string
    type: SomeBasicType | SomeUnionType
    prompt: Prompt<SomeBasicType>
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    optionality:
      | { _tag: 'required' }
      | { _tag: 'optional' }
      | { _tag: 'default'; tag: string; value: ArgumentValueScalar | (() => ArgumentValueScalar) }
    description?: string
    parameters: {
      nameExpression: string
      type: SomeExclusiveZodType
    }[]
  }
}
