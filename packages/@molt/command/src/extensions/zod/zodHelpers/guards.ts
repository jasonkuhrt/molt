import { z } from 'zod'

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

export const isOptional = (
  type: z.ZodFirstPartySchemaTypes,
): type is z.ZodOptional<z.ZodFirstPartySchemaTypes> => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional
}

export const isDefault = (
  type: z.ZodFirstPartySchemaTypes,
): type is z.ZodDefault<z.ZodFirstPartySchemaTypes> => {
  return type._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault
}

export const isFirstParty = (type: z.ZodFirstPartySchemaTypes): type is z.ZodFirstPartySchemaTypes => {
  return type._def.typeName in z.ZodFirstPartyTypeKind
}

export const isOptionalOrDefault = (
  type: z.ZodFirstPartySchemaTypes,
): type is z.ZodOptional<z.ZodFirstPartySchemaTypes> | z.ZodDefault<z.ZodFirstPartySchemaTypes> => {
  return isOptional(type) || isDefault(type)
}
