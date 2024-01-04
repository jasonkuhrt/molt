import type { Type } from '../../Type/index.js'
import type { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import type { TypeBuilderBoolean } from './types/boolean.js'
import type { TypeBuilderEnumeration } from './types/enumeration.js'
import type { TypeBuilderNumber } from './types/number.js'
import type { TypeBuilderString } from './types/string.js'
import type { TypeBuilderUnion } from './types/union.js'

export namespace TypeBuilder {
  export type Union = TypeBuilderUnion
  export type String = TypeBuilderString
  export type Boolean = TypeBuilderBoolean
  export type Enumeration = TypeBuilderEnumeration<any>
  export type Number = TypeBuilderNumber
  // prettier-ignore
  export type $InferType<$TypeBuilder extends TypeBuilder> =
    Type.Infer<
      BuilderKit.Builder.Resolve<$TypeBuilder>
    >
}

export type TypeBuilder =
  | TypeBuilderString
  | TypeBuilderBoolean
  | TypeBuilderNumber
  // todo remove any type
  | TypeBuilderEnumeration<any>
  | TypeBuilderUnion
