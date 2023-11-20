import type { Type } from '../../../Type/index.js'
import type { z } from 'zod'

// prettier-ignore
export type FromZod<ZodType extends z.ZodType> = ZodType extends z.ZodOptional<infer T>
  ? Type.Union<[FromZodRequired<T>, Type.Literal<undefined>]>
  : FromZodRequired<ZodType>

// prettier-ignore
export type FromZodRequired<ZodType extends z.ZodType> = ZodType extends ZodTypeScalar ? FromZodScalar<ZodType>
  : ZodType extends z.ZodDefault<infer T> ? FromZodScalar<T>
  : ZodType extends z.ZodUnion<infer T> ? Type.Union<{ [i in keyof T]: FromZodScalar<T[i]> }>
  : never

// prettier-ignore
export type FromZodScalar<ZodType extends ZodTypeScalar> = ZodType extends z.ZodString ? Type.Scalar.String
  : ZodType extends z.ZodLiteral<infer T extends boolean | string | number> ? Type.Scalar.Literal<T>
  : ZodType extends z.ZodNumber ? Type.Scalar.Number
  : ZodType extends z.ZodBoolean ? Type.Scalar.Boolean
  : ZodType extends z.ZodEnum<infer T> ? Type.Scalar.Enumeration<T>
  : ZodType extends z.ZodNativeEnum<infer T extends z.EnumLike>
    ? Type.Scalar.Enumeration<EnumerationMembersFromZodEnumLike<T>>
  : never

type EnumerationMembersFromZodEnumLike<T extends z.EnumLike> = T[keyof T][]

type ZodTypeScalar =
  | z.ZodString
  | z.ZodBoolean
  | z.ZodLiteral<any>
  | z.ZodNumber
  | z.ZodEnum<any>
  | z.ZodNativeEnum<any>
// prettier-ignore
