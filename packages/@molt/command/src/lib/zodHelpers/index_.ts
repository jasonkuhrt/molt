import { z } from 'zod'

export type ZodPrimitive = 'ZodBoolean' | 'ZodNumber' | 'ZodString' | 'ZodEnum'

export type Primitive = 'boolean' | 'number' | 'string'

export const isOptional = (schema: z.ZodTypeAny) => {
  if (schema instanceof z.ZodOptional) {
    return true
  }
  if (schema instanceof z.ZodDefault) {
    return true
  }
  return false
}

export const getEnum = (schema: z.ZodTypeAny): null | z.ZodEnum<[string, ...string[]]> => {
  if (!(`_def` in schema)) throw new Error(`Expected a Zod schema.`)
  if (!(`typeName` in schema._def)) throw new Error(`Expected a Zod schema.`)

  if (schema instanceof z.ZodNullable) {
    return getEnum(schema.unwrap() as z.ZodTypeAny)
  }

  // eslint-disable-next-line
  if (schema instanceof z.ZodDefault) {
    // eslint-disable-next-line
    return getEnum(schema._def.innerType)
  }

  // eslint-disable-next-line
  if (schema instanceof z.ZodOptional) {
    return getEnum(schema.unwrap() as z.ZodTypeAny)
  }

  if (schema instanceof z.ZodEnum) {
    return schema
  }

  return null
}

export const getZodPrimitive = (schema: z.ZodTypeAny): ZodPrimitive => {
  if (!(`_def` in schema)) throw new Error(`Expected a Zod schema.`)
  if (!(`typeName` in schema._def)) throw new Error(`Expected a Zod schema.`)

  // eslint-disable-next-line
  if (schema instanceof z.ZodDefault) {
    // if (schema._def.typeName === `ZodDefault`) {
    // eslint-disable-next-line
    return getZodPrimitive(schema._def.innerType)
  }

  // eslint-disable-next-line
  if (schema instanceof z.ZodOptional) {
    // if (schema._def.typeName === `ZodOptional`) {
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
