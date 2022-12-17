import type { z } from 'zod'

export type ArgumentValue = string | boolean | number

export type SomeExclusiveZodType = z.ZodString | z.ZodEnum<[string, ...string[]]> | z.ZodNumber | z.ZodBoolean

export type SomeUnionZodType = z.ZodUnion<[SomeScalarZodType, SomeScalarZodType, ...SomeScalarZodType[]]>

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
