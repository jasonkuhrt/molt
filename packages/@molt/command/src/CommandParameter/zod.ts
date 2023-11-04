import type { z } from 'zod'

type ZodEnumBase = z.ZodEnum<[string, ...string[]]>

type ZodNativeEnumBase = z.ZodNativeEnum<any>

export type SomeBasicType =
  | SomeBasicTypeScalar
  | z.ZodOptional<SomeBasicTypeScalar>
  | z.ZodDefault<SomeBasicTypeScalar>

export type SomeUnionType = SomeUnionTypeScalar | z.ZodOptional<SomeUnionType> | z.ZodDefault<SomeUnionType>

export type SomeExclusiveZodType = SomeBasicTypeScalar

export type SomeUnionTypeScalar = z.ZodUnion<
  [SomeBasicTypeScalar, SomeBasicTypeScalar, ...SomeBasicTypeScalar[]]
>

// prettier-ignore
export type SomeBasicTypeScalar =
  | z.ZodString
  | ZodEnumBase
  | ZodNativeEnumBase
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodLiteral<number>
  | z.ZodLiteral<string>
  | z.ZodLiteral<boolean>
