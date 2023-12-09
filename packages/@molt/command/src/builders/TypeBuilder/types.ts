import type { Type } from '../../Type/index.js'
import type { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type { TypeBuilderBoolean } from './types/boolean.js'
import type { TypeBuilderEnumeration } from './types/enum.js'
import type { TypeBuilderNumber } from './types/number.js'
import type { TypeBuilderString } from './types/string.js'
import type { TypeBuilderUnion } from './types/union.js'

export namespace TypeBuilder {
  export type Union = TypeBuilderUnion
  export type String = TypeBuilderString
  export type Boolean = TypeBuilderBoolean
  export type Enumeration = TypeBuilderEnumeration<any>
  export type Number = TypeBuilderNumber
  export type $InferType<$TypeBuilder extends TypeBuilder> = Type.Infer<
    PrivateData.Get<$TypeBuilder>['type']
  >
}

export type TypeBuilder =
  | TypeBuilder.String
  | TypeBuilder.Boolean
  | TypeBuilder.Enumeration
  | TypeBuilder.Number
  | TypeBuilder.Union
