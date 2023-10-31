import type { Optionality } from '../lib/Pam/parameter.js'
import type { PromptEngine } from '../lib/PromptEngine/PromptEngine.js'
import type { Tex } from '../lib/Tex/index.js'
import type { ValidationResult } from './Type.js'
import type { Effect, Either } from 'effect'

export const TypeSymbol = Symbol(`type`)

export const runtimeIgnore: any = true

export type TypeSymbol = typeof TypeSymbol

export interface Type<T = any> {
  [TypeSymbol]: T
  _tag: string
  description: null | string
  validate: (value: unknown) => ValidationResult<T>
  transform?: (value: T) => T
  help: () => string | Tex.Block
  // TODO use Either type here
  deserialize: (serializedValue: string) => Either.Either<Error, T>
  prompt: (params: {
    channels: PromptEngine.Channels
    optionality: Optionality
    prompt: string
    marginLeft?: number
  }) => Effect.Effect<never, never, T | undefined>
}

export type Infer<T extends Type<any>> = T[TypeSymbol]
