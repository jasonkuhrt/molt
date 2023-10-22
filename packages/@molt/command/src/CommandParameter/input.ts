import type { EventPatternsInput } from '../eventPatterns.js'
import type { Parameter } from '../Parameter/Parameter.js'
import type { Type } from '../Type/index.js'
import type { SomeBasicType, SomeExclusiveZodType, SomeUnionType } from './types.js'

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
    description: string | null
    optionality: Parameter.Optionality
    type: Type.Type
    prompt: Prompt<SomeBasicType>
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    optionality:
      | { _tag: 'required' }
      | { _tag: 'optional' }
      | { _tag: 'default'; tag: string; value: Parameter.Value | (() => Parameter.Value) }
    description?: string
    parameters: {
      nameExpression: string
      type: SomeExclusiveZodType
    }[]
  }
}
