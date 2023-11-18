import { Type } from '../Type/index.js'
import { EventPatternsInput } from '../eventPatterns.js'

export type Prompt<T extends Type.Type> =
  | null
  | boolean
  | {
      enabled?: boolean
      when?: EventPatternsInput<T>
    }
