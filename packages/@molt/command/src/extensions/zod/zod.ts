import { createExtension } from '../../extension.js'
import type { HKT } from '../../helpers.js'
import { TypeAdaptor } from './TypeAdaptor/index.js'
import type { z } from 'zod'

type ZodEnumBase = z.ZodEnum<[string, ...string[]]>

type ZodNativeEnumBase = z.ZodNativeEnum<any>

// prettier-ignore
type SomeBasicTypeScalar =
  | z.ZodString
  | ZodEnumBase
  | ZodNativeEnumBase
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodLiteral<number>
  | z.ZodLiteral<string>
  | z.ZodLiteral<boolean>

export type SomeBasicType =
  | SomeBasicTypeScalar
  | z.ZodOptional<SomeBasicTypeScalar>
  | z.ZodDefault<SomeBasicTypeScalar>

type SomeUnionTypeScalar = z.ZodUnion<[SomeBasicTypeScalar, SomeBasicTypeScalar, ...SomeBasicTypeScalar[]]>

export type SomeUnionType = SomeUnionTypeScalar | z.ZodOptional<SomeUnionType> | z.ZodDefault<SomeUnionType>

export type ZodType = SomeBasicType | SomeUnionType

interface ZodTypeMapper extends HKT.Fn<z.ZodTypeAny> {
  return: TypeAdaptor.Zod.FromZod<this['params']>
}

export const Zod = createExtension<ZodType, ZodTypeMapper>({
  name: `Zod`,
  type: (zodType) => {
    return TypeAdaptor.Zod.fromZod(zodType) as any
  },
})
