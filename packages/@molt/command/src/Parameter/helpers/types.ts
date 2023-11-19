import type { EventPatternsInput } from '../../eventPatterns.js'
import type { Type } from '../../Type/index.js'

export type Environment = null | { enabled: boolean; namespaces: string[] }

export type Prompt<T extends Type.Type = Type.Type> = {
  enabled: boolean | null
  when: EventPatternsInput<T> | null
}
