import type { EventPatternsInput } from '../eventPatterns.js'
import type { Type } from '../Type/index.js'
import type { ParameterBasic } from './basic.js'
import type { ParameterExclusive } from './exclusive.js'

export type Parameter = ParameterBasic | ParameterExclusive

export type Prompt<T extends Type.Type> =
  | null
  | boolean
  | {
    enabled?: boolean
    when?: EventPatternsInput<T>
  }
