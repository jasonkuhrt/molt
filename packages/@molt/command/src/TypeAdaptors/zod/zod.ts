import { ZodHelpers } from '../../lib/zodHelpers/index.js'
import { Type } from '../../Type/index.js'
import { z } from 'zod'

export * from './helpers.js'

// prettier-ignore
export type FromZod<ZodType extends z.ZodType> =
  ZodType extends z.ZodString                                           ? Type.Scalar.String :
  ZodType extends z.ZodBoolean                                          ? Type.Scalar.Boolean :
  ZodType extends z.ZodLiteral<infer T extends boolean|string|number>   ? Type.Scalar.Literal<T> :
  ZodType extends z.ZodNumber                                           ? Type.Scalar.Number :
  ZodType extends z.ZodEnum<infer T>                                    ? Type.Scalar.Enumeration<T> :
  // ZodType extends z.ZodNativeEnum<infer T>                                    ? Type.Scalar.Enumeration<T> :
                                                                          never

// prettier-ignore
export const fromZod = (zodType: z.ZodFirstPartySchemaTypes): Type.Type => {
  const zt = ZodHelpers.stripOptionalAndDefault(zodType)
  if (zt instanceof z.ZodString)          return Type.string() // todo forward refinements
  if (zt instanceof z.ZodNumber)          return Type.number() // todo forward refinements
  if (zt instanceof z.ZodEnum)            return Type.enumeration(zt._def.values)
  if (zt instanceof z.ZodNativeEnum)      return Type.enumeration(zt._def.values)
  if (zt instanceof z.ZodBoolean)         return Type.boolean()
  if (zt instanceof z.ZodUnion)           {
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
  if (zt instanceof z.ZodLiteral)         return Type.literal(zt._def.value)
  console.log(zt)
  throw new Error(`Unsupported zodType: ${JSON.stringify(zt[`_def`])}`)
}
