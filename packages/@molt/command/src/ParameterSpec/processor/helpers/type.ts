import type { SomeBasicType, Type } from '../../types.js'
import { getBasicScalar } from '../../types.js'

export const analyzeZodTypeScalar = (zodType: SomeBasicType) => {
  let description = zodType.description ?? null
  let primitiveType = zodType

  while (primitiveType._def.typeName === `ZodDefault` || primitiveType._def.typeName === `ZodOptional`) {
    description = description ?? primitiveType._def.innerType.description ?? null
    primitiveType = primitiveType._def.innerType
  }

  const zodTypeScalar = getBasicScalar(primitiveType)

  const type: Type =
    zodTypeScalar._def.typeName === `ZodString`
      ? { _tag: `TypeString` }
      : zodTypeScalar._def.typeName === `ZodBoolean`
      ? { _tag: `TypeBoolean` }
      : zodTypeScalar._def.typeName === `ZodNumber`
      ? { _tag: `TypeNumber` }
      : { _tag: `TypeEnum`, members: zodTypeScalar._def.values }

  return {
    description,
    type,
  }
}
