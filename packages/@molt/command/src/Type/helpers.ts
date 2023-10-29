import type { ValidationResult } from './Type.js'

export const TypeSymbol = Symbol(`type`)

export const runtimeIgnore: any = true

export type TypeSymbol = typeof TypeSymbol

export interface Type<T = any> {
  [TypeSymbol]: T
  _tag: string
  description: null | string
  validate: (value: unknown) => ValidationResult<T>
  transform?: (value: T) => T
  // todo account for terminal help rendering
  // todo account for terminal prompting
}

export type Infer<T extends Type<any>> = T[TypeSymbol]
