import type { EventPatternsInput } from '../eventPatterns.js'
import type { Type } from '../Type/index.js'

export type Prompt<T extends Type.Type> =
  | null
  | boolean
  | {
      enabled?: boolean
      when?: EventPatternsInput<T>
    }
