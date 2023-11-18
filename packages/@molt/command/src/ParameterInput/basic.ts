import type { State } from '../builders/State.js'
import type { HKT } from '../helpers.js'
import { Prompt } from './types.js'

export interface Basic<$State extends State.Base> {
  _tag: 'Basic'
  nameExpression: string
  type: $State['Schema']
  prompt: Prompt<HKT.Call<$State['SchemaMapper'], $State['Schema']>>
}
