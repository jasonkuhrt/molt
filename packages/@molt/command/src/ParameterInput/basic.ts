import type { State } from '../builders/State.js'
import type { HKT } from '../helpers.js'
import type { Prompt } from './types.js'

export interface Basic<$State extends State.Base> {
  _tag: 'Basic'
  nameExpression: string
  type: $State['Type']
  prompt: Prompt<HKT.Call<$State['TypeMapper'], $State['Type']>>
}
