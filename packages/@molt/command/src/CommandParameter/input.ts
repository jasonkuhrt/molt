import type { EventPatternsInput } from '../eventPatterns.js'
import type { Pam } from '../lib/Pam/index.js'
import type { Type } from '../Type/index.js'
import type { TypeAdaptors } from '../TypeAdaptors/index.js'
import type { SomeBasicType, SomeExclusiveZodType, SomeUnionType } from './types.js'

export type Input = Input.Basic | Input.Exclusive

export namespace Input {
  export type Schema = SomeBasicType | SomeUnionType

  export type Prompt<T extends Type.Type> =
    | null
    | boolean
    | {
        enabled?: boolean
        when?: EventPatternsInput<T>
      }

  export interface Basic {
    _tag: 'Basic'
    nameExpression: string
    type: SomeBasicType | SomeUnionType
    prompt: Prompt<TypeAdaptors.Zod.FromZod<SomeBasicType>>
  }

  export interface Exclusive {
    _tag: 'Exclusive'
    optionality:
      | { _tag: 'required' }
      | { _tag: 'optional' }
      | { _tag: 'default'; tag: string; value: Pam.Value | (() => Pam.Value) }
    description?: string
    parameters: {
      nameExpression: string
      type: SomeExclusiveZodType
    }[]
  }
}
