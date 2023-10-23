import { Type } from '../../Type/index.js'
import { z } from 'zod'

export * from './helpers.js'

// prettier-ignore
export type FromZod<ZodType extends z.ZodType> =
  ZodType extends z.ZodString   ? Type.Scalar.String :
  ZodType extends z.ZodBoolean  ? Type.Scalar.Boolean :
  ZodType extends z.ZodNumber   ? Type.Scalar.Number :
                                  never

export const fromZod = (zodType: z.ZodType): Type.Type => {
  if (zodType instanceof z.ZodString) return Type.string() // todo forward refinements
  if (zodType instanceof z.ZodNumber) return Type.number() // todo forward refinements
  if (zodType instanceof z.ZodEnum) return Type.enumeration(zodType._def.values)
  if (zodType instanceof z.ZodBoolean) return Type.boolean()
  throw new Error(`Unsupported zodType`)
}
