import { ZodHelpers } from '../lib/zodHelpers/index.js'
import { stripOptionalAndDefault } from '../lib/zodHelpers/index_.js'
import type { z } from 'zod'

export type ArgumentValue = string | boolean | number

export type SomeExclusiveZodType = SomeScalarZodType

export type SomeUnionTypeScalar = z.ZodUnion<[SomeScalarZodType, SomeScalarZodType, ...SomeScalarZodType[]]>

export type SomeUnionType = SomeUnionTypeScalar | z.ZodOptional<SomeUnionType> | z.ZodDefault<SomeUnionType>

// prettier-ignore
export type SomeScalarZodType =
  | z.ZodString
  | z.ZodEnum<[string, ...string[]]>
  | z.ZodNumber
  | z.ZodBoolean

export type SomeBasicZodType =
  | SomeScalarZodType
  | z.ZodOptional<z.ZodString | z.ZodBoolean | z.ZodNumber | z.ZodEnum<[string, ...string[]]>>
  | z.ZodDefault<z.ZodString | z.ZodBoolean | z.ZodNumber | z.ZodEnum<[string, ...string[]]>>

export const isUnionType = (type: SomeBasicZodType | SomeUnionType): type is SomeUnionType => {
  const type_ = stripOptionalAndDefault(type)
  const isUnion = type_._def.typeName === `ZodUnion`
  return isUnion
}

export const getUnionScalar = (type: SomeUnionType): SomeUnionTypeScalar => {
  const type2 = ZodHelpers.stripOptionalAndDefault(type)
  return type2
}
