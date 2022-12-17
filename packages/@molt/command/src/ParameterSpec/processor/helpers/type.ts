import { ZodHelpers } from '../../../lib/zodHelpers/index.js'
import type { SomeBasicZodType } from '../../types.js'

export const analyzeTypeScalar = (type: SomeBasicZodType) => {
  let description = type.description ?? null
  let primitiveType = type

  while (primitiveType._def.typeName === `ZodDefault` || primitiveType._def.typeName === `ZodOptional`) {
    description = description ?? primitiveType._def.innerType.description ?? null
    primitiveType = primitiveType._def.innerType
  }

  const primitiveKind = ZodHelpers.ZodPrimitiveToPrimitive[ZodHelpers.getZodPrimitive(primitiveType)]

  return {
    description,
    primitiveKind,
  }
}
