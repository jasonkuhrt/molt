import type { z } from 'zod'

export type ZodPrimitive = 'ZodBoolean' | 'ZodNumber' | 'ZodString' | 'ZodEnum'

export type Primitive = 'boolean' | 'number' | 'string'

export const getZodPrimitive = (schema: z.ZodTypeAny): ZodPrimitive => {
  if (!(`_def` in schema)) throw new Error(`Expected a Zod schema.`)
  if (!(`typeName` in schema._def)) throw new Error(`Expected a Zod schema.`)

  // eslint-disable-next-line
  if (schema._def.typeName === `ZodDefault`) {
    // eslint-disable-next-line
    return getZodPrimitive(schema._def.innerType)
  }

  // eslint-disable-next-line
  if (schema._def.typeName === `ZodOptional`) {
    // eslint-disable-next-line
    return getZodPrimitive(schema._def.innerType)
  }

  // eslint-disable-next-line
  return schema._def.typeName
}

export const ZodPrimitiveToPrimitive = {
  ZodBoolean: `boolean`,
  ZodString: `string`,
  ZodEnum: `string`,
  ZodNumber: `number`,
} as const
