import type { Type, TypeSymbol } from './helpers.js'
import type { Either } from 'effect'

export * from './helpers.js'
export { Scalar } from './types/Scalar.js'
export * from './types/Scalars/index.js'
export * from './types/Union.js'

export type ValidationResult<T> = Either.Either<{ value: unknown; errors: string[] }, T>

export type Infer<$Type extends Type<any>> = $Type[TypeSymbol]
