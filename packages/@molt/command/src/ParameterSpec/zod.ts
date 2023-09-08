import { ZodHelpers } from '../lib/zodHelpers/index.js'
import { stripOptionalAndDefault } from '../lib/zodHelpers/index_.js'
import { z } from 'zod'

export type SomeBasicParameterType = SomeBasicType | SomeUnionType

export type SomeBasicType =
  | SomeBasicTypeScalar
  | z.ZodOptional<z.ZodString | z.ZodBoolean | z.ZodNumber | z.ZodEnum<[string, ...string[]]>>
  | z.ZodDefault<z.ZodString | z.ZodBoolean | z.ZodNumber | z.ZodEnum<[string, ...string[]]>>

export type SomeUnionType = SomeUnionTypeScalar | z.ZodOptional<SomeUnionType> | z.ZodDefault<SomeUnionType>

export type SomeExclusiveZodType = SomeBasicTypeScalar

export type SomeUnionTypeScalar = z.ZodUnion<
  [SomeBasicTypeScalar, SomeBasicTypeScalar, ...SomeBasicTypeScalar[]]
>

// prettier-ignore
export type SomeBasicTypeScalar =
  | z.ZodString
  | z.ZodEnum<[string, ...string[]]>
  | z.ZodNumber
  | z.ZodBoolean

export const isUnionType = (type: SomeBasicType | SomeUnionType): type is SomeUnionType => {
  const type_ = stripOptionalAndDefault(type)
  const isUnion = type_._def.typeName === z.ZodFirstPartyTypeKind.ZodUnion
  return isUnion
}

export const getUnionScalar = (zodType: SomeUnionType): SomeUnionTypeScalar => {
  const zodScalarType = ZodHelpers.stripOptionalAndDefault(zodType)
  return zodScalarType
}

export const getBasicScalar = (zodType: SomeBasicType): SomeBasicTypeScalar => {
  const type = ZodHelpers.stripOptionalAndDefault(zodType)
  return type
}
