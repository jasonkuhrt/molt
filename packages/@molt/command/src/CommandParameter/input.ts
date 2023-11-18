import type { State } from '../builders/State.js'
import type { EventPatternsInput } from '../eventPatterns.js'
import type { HKT } from '../helpers.js'
import type { Pam } from '../lib/Pam/index.js'
import type { Type } from '../Type/index.js'

export type Input<$State extends State.Base> = Input.Basic<$State> | Input.Exclusive<$State>

export namespace Input {
  export type Prompt<T extends Type.Type> =
    | null
    | boolean
    | {
        enabled?: boolean
        when?: EventPatternsInput<T>
      }

  export interface Basic<$State extends State.Base> {
    _tag: 'Basic'
    nameExpression: string
    type: $State['Schema']
    prompt: Prompt<HKT.Call<$State['SchemaMapper'], $State['Schema']>>
  }

  export interface Exclusive<$State extends State.Base> {
    _tag: 'Exclusive'
    optionality:
      | { _tag: 'required' }
      | { _tag: 'optional' }
      | { _tag: 'default'; tag: string; value: Pam.Value | (() => Pam.Value) }
    description?: string
    parameters: {
      nameExpression: string
      type: $State['Schema']
    }[]
  }
}
