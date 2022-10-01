import type { z } from 'zod'

export type ZodPrimitive = 'ZodBoolean' | 'ZodNumber' | 'ZodString'

export const getZodPrimitive = (schema: z.ZodSchema): ZodPrimitive => {
  // @ts-expect-error ignore-me
  if (schema._def.typeName === `ZodDefault`) {
    // @ts-expect-error ignore-me
    // eslint-disable-next-line
    return getZodPrimitive(schema._def.innerType)
  }

  // @ts-expect-error ignore-me
  if (schema._def.typeName === `ZodOptional`) {
    // @ts-expect-error ignore-me
    // eslint-disable-next-line
    return getZodPrimitive(schema._def.innerType)
  }

  // @ts-expect-error ignore-me
  // eslint-disable-next-line
  return schema._def.typeName
}

export const ZodPrimitiveToPrimitive = {
  ZodBoolean: `boolean`,
  ZodString: `string`,
  ZodNumber: `number`,
} as const
