import type { z } from 'zod'

export type ZodType = SomeBasicType | SomeUnionType

type ZodEnumBase = z.ZodEnum<[string, ...string[]]>

type ZodNativeEnumBase = z.ZodNativeEnum<any>

type SomeBasicType =
  | SomeBasicTypeScalar
  | z.ZodOptional<SomeBasicTypeScalar>
  | z.ZodDefault<SomeBasicTypeScalar>

type SomeUnionType = SomeUnionTypeScalar | z.ZodOptional<SomeUnionType> | z.ZodDefault<SomeUnionType>

type SomeUnionTypeScalar = z.ZodUnion<[SomeBasicTypeScalar, SomeBasicTypeScalar, ...SomeBasicTypeScalar[]]>

type SomeBasicTypeScalar =
  | z.ZodString
  | ZodEnumBase
  | ZodNativeEnumBase
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodLiteral<number>
  | z.ZodLiteral<string>
  | z.ZodLiteral<boolean>
