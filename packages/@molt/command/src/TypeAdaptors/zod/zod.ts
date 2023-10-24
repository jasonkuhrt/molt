import { ZodHelpers } from '../../lib/zodHelpers/index.js'
import { Type } from '../../Type/index.js'
import type { z } from 'zod'

export * from './helpers.js'

// prettier-ignore
export type FromZod<ZodType extends z.ZodType> =
  ZodType extends z.ZodString                                           ? Type.Scalar.String :
  ZodType extends z.ZodBoolean                                          ? Type.Scalar.Boolean :
  ZodType extends z.ZodLiteral<infer T extends boolean|string|number>   ? Type.Scalar.Literal<T> :
  ZodType extends z.ZodNumber                                           ? Type.Scalar.Number :
  ZodType extends z.ZodEnum<infer T>                                    ? Type.Scalar.Enumeration<T> :
  ZodType extends z.ZodOptional<infer T>                                ? FromZod<T> :
  ZodType extends z.ZodDefault<infer T>                                 ? FromZod<T> :
  // ZodType extends z.ZodNativeEnum<infer T>                                    ? Type.Scalar.Enumeration<T> :
                                                                          never

// prettier-ignore
export const fromZod = (zodType: z.ZodFirstPartySchemaTypes): Type.Type => {
  const zt = zodType
  if (ZodHelpers.isString(zt))          return Type.string() // todo forward refinements
  if (ZodHelpers.isNumber(zt))          return Type.number() // todo forward refinements
  if (ZodHelpers.isEnum(zt))            return Type.enumeration(zt._def.values)
  if (ZodHelpers.isNativeEnum(zt))      return Type.enumeration(zt._def.values)
  if (ZodHelpers.isBoolean(zt))         return Type.boolean()
  if (ZodHelpers.isLiteral(zt))         return Type.literal(zt._def.value)
  if (ZodHelpers.isDefault(zt))         return fromZod(zt._def.innerType)
  if (ZodHelpers.isOptional(zt))        return fromZod(zt._def.innerType)
  if (ZodHelpers.isUnion(zt))           {
    if (!Array.isArray(zt._def.options)) {
      throw new Error(`Unsupported zodType: ${JSON.stringify(zt[`_def`])}`)
    }
    return Type.union(
      zt._def.options.map(_ => {
        return {
          description: null, // todo forward from zod
          type: fromZod(_)
        }
      })
    )
  }
  console.log(zt)
  throw new Error(`Unsupported zodType: ${JSON.stringify(zt[`_def`])}`)
}
