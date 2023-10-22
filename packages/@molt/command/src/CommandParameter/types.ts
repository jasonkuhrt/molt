import type { Pam } from '../lib/Pam/index.js'

export * from '../TypeAdaptors/zod/types.js'

export type ArgumentValueMutuallyExclusive = {
  _tag: string
  value: Pam.Value
}

export type ArgumentValue = undefined | Pam.Value | ArgumentValueMutuallyExclusive
