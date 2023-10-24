import type { RenameKey } from '../prelude.js'
import type { Simplify } from 'type-fest'
import { z } from 'zod'

export type ZodDateCheck = Simplify<RenameKey<z.ZodDateCheck, 'kind', '_tag'>>

export type ZodNumberCheck = Simplify<RenameKey<z.ZodNumberCheck, 'kind', '_tag'>>

export type ZodStringCheck = Simplify<RenameKey<z.ZodStringCheck, 'kind', '_tag'>>

export type ZodPrimitive = 'ZodBoolean' | 'ZodNumber' | 'ZodString' | 'ZodEnum'

export type Primitive = 'boolean' | 'number' | 'string'

export const stripOptionalAndDefault = <T extends z.ZodFirstPartySchemaTypes>(
  type: T,
): Exclude<T, z.ZodOptional<any> | z.ZodDefault<any>> => {
  if (type instanceof z.ZodOptional) {
    return stripOptionalAndDefault(type._def.innerType)
  }
  if (type instanceof z.ZodDefault) {
    return stripOptionalAndDefault(type._def.innerType)
  }
  return type as any
}

export const isUnion = (type: z.ZodFirstPartySchemaTypes): type is z.ZodUnion<any> => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodUnion
}

export const isLiteral = (type: z.ZodFirstPartySchemaTypes): type is z.ZodLiteral<any> => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodLiteral
}

export const isString = (type: z.ZodFirstPartySchemaTypes): type is z.ZodString => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodString
}

export const isBoolean = (type: z.ZodFirstPartySchemaTypes): type is z.ZodBoolean => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodBoolean
}

export const isNumber = (type: z.ZodFirstPartySchemaTypes): type is z.ZodNumber => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodNumber
}

export const isNativeEnum = (type: z.ZodFirstPartySchemaTypes): type is z.ZodNativeEnum<any> => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodNativeEnum
}

export const isEnum = (type: z.ZodFirstPartySchemaTypes): type is z.ZodEnum<any> => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodEnum
}

export const isUnionUnwrapped = (type: z.ZodFirstPartySchemaTypes) => {
  const type_ = stripOptionalAndDefault(type)
  const isUnion = type_._def.typeName === z.ZodFirstPartyTypeKind.ZodUnion
  return isUnion
}

export const isOptional = (schema: z.ZodTypeAny) => {
  if (schema instanceof z.ZodOptional) {
    return true
  }
  if (schema instanceof z.ZodDefault) {
    return true
  }
  return false
}

export const getEnum = (type: z.ZodTypeAny): null | z.ZodEnum<[string, ...string[]]> => {
  if (!(`_def` in type)) throw new Error(`Expected a Zod schema.`)
  if (!(`typeName` in type._def)) throw new Error(`Expected a Zod schema.`)

  if (type instanceof z.ZodNullable) {
    return getEnum(type.unwrap() as z.ZodTypeAny)
  }

  // eslint-disable-next-line
  if (type instanceof z.ZodDefault) {
    // eslint-disable-next-line
    return getEnum(type._def.innerType)
  }

  // eslint-disable-next-line
  if (type instanceof z.ZodOptional) {
    return getEnum(type.unwrap() as z.ZodTypeAny)
  }

  if (type instanceof z.ZodEnum) {
    return type
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
