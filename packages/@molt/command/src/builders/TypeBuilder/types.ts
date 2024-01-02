import type { Type } from '../../Type/index.js'
import type { BuilderKit } from '../../lib/BuilderKit/BuilderKit.js'
import type { Chain } from './types/boolean.js'
import type { TypeBuilderEnumeration } from './types/enumeration.js'
import type { Chain } from './types/number.js'
import type { Chain } from './types/string.js'
import type { Chain } from './types/union.js'

export namespace TypeBuilder {
  export type Union = Chain
  export type String = Chain
  export type Boolean = Chain
  export type Enumeration = TypeBuilderEnumeration<any>
  export type Number = Chain
  // prettier-ignore
  export type $InferType<$TypeBuilder extends TypeBuilder> =
    Type.Infer<
      BuilderKit.State.Resolve<$TypeBuilder>
    >
}

export type TypeBuilder =
  | TypeBuilder.String
  | TypeBuilder.Boolean
  | TypeBuilder.Enumeration
  | TypeBuilder.Union
