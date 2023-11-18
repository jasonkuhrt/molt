import type { State } from '../builders/State.js'
import type { Pam } from '../lib/Pam/index.js'

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
