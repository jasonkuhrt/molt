import type { TypeBooleanBuilder } from './types/boolean.js'
import type { TypeEnumerationBuilder } from './types/enum.js'
import type { TypeStringBuilder } from './types/string.js'

export namespace TypeBuilder {
  export type String = TypeStringBuilder
  export type Boolean = TypeBooleanBuilder
  export type Enumeration = TypeEnumerationBuilder<any>
}

export type TypeBuilder =
  | TypeBuilder.Boolean
  | TypeBuilder.String
  | TypeBuilder.Enumeration
