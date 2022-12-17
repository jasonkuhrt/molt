import { ZodHelpers } from '../../../lib/zodHelpers/index.js'
import type { SomeScalarZodType } from '../../types.js'

export const analyzeTypeScalar = (type: SomeScalarZodType) => {
  const description = type.description ?? null
  const primitiveKind = ZodHelpers.ZodPrimitiveToPrimitive[ZodHelpers.getZodPrimitive(type)]

  return {
    description,
    primitiveKind,
  }
}
