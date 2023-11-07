import type { PromptEngine } from '../lib/PromptEngine/PromptEngine.js'
import type { Tex } from '../lib/Tex/index.js'
import type { ValidationResult } from './Type.js'
import type { Effect, Either } from 'effect'

export const TypeSymbol = Symbol(`type`)

export const runtimeIgnore: any = true

export type TypeSymbol = typeof TypeSymbol

export type Optionality<T> =
  | { _tag: 'required' }
  | { _tag: 'optional' }
  | { _tag: 'default'; getValue: () => T }

export interface Type<T = any> {
  _tag: string
  description: null | string
  [TypeSymbol]: T
  optionality: Optionality<T>
  validate: (value: unknown) => ValidationResult<T>
  transform?: (value: T) => T
  priority: number
  help: (settings?: any) => string | Tex.Block
  display: () => string
  displayExpanded: () => string
  // TODO use Either type here
  deserialize: (serializedValue: string) => Either.Either<Error, T>
  prompt: (params: {
    channels: PromptEngine.Channels
    prompt: string
    marginLeft?: number
  }) => Effect.Effect<never, never, T | undefined>
}

export type Infer<T extends Type<any>> = T[TypeSymbol]
