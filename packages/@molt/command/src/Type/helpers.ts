import type { Tex } from '../lib/Tex/index.js'
import { Term } from '../term.js'
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
  help: () => string | Tex.Block
  // todo account for terminal prompting
}

// export const createType = <T, AdditionalInput extends object>(
//   constructor: (
//     params: AdditionalInput & Pick<Type<T>, 'description'>,
//   ) => AdditionalInput & Omit<Type<T>, TypeSymbol | 'help' | 'description'> & { help?: () => string },
// ): (<$T extends T>(params: AdditionalInput & Pick<Type<$T>, 'description'>) => Type<T>) => {
//   return (params) => {
//     const properties = constructor(params)
//     const propertyDefaults = {
//       [TypeSymbol]: runtimeIgnore, // eslint-disable-line
//       description: params.description ?? null,
//       help: () => Term.colors.positive(properties[`_tag`]),
//     }
//     return {
//       propertyDefaults,
//       properties,
//     }
//   }
// }

export type Infer<T extends Type<any>> = T[TypeSymbol]
