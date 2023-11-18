import type { State } from '../builders/State.js'
import type { Basic } from './basic.js'
import type { Exclusive } from './exclusive.js'

export type Input<$State extends State.Base> = Basic<$State> | Exclusive<$State>
