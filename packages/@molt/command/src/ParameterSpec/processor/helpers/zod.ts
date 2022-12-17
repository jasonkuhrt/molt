import { ZodHelpers } from '../../../lib/zodHelpers/index.js'
import type { Input } from '../../ParametersSpec.js'
import type { ArgumentValue, SomeScalarZodType } from '../../types.js'

type DefaultGetter = () => ArgumentValue
type PrimitiveKind = 'string' | 'number' | 'boolean'

export const analyzeBasic = (
  input: Input.Basic
): {
  isOptional: boolean
  description: null | string
  defaultGetter: null | DefaultGetter
  primitiveKind: PrimitiveKind
} => {
  // TODO check how to actually do this.
  const isOptional = ZodHelpers.isOptional(input.type)

  // TODO check how to actually do this.
  // eslint-disable-next-line
  // @ts-expect-error todo
  const hasDefault = typeof input.type._def.defaultValue !== `undefined`
  // @ts-expect-error todo
  // eslint-disable-next-line
  const defaultGetter = hasDefault ? (input.type._def.defaultValue as DefaultGetter) : null
  const description = input.type.description ?? null
  const primitiveKind = ZodHelpers.ZodPrimitiveToPrimitive[ZodHelpers.getZodPrimitive(input.type)]

  return {
    isOptional,
    defaultGetter,
    description,
    primitiveKind,
  }
}

export const analyzeUnion = (
  input: Input.Union
): {
  isOptional: boolean
  description: null | string
  defaultGetter: null | DefaultGetter
  types: {
    type: SomeScalarZodType
    typePrimitiveKind: PrimitiveKind
  }[]
} => {
  // TODO check how to actually do this.
  // eslint-disable-next-line
  const isOptional = ZodHelpers.isOptional(input.type)

  // TODO check how to actually do this.
  // eslint-disable-next-line
  // @ts-expect-error todo
  const hasDefault = typeof input.type._def.defaultValue !== `undefined`
  // @ts-expect-error todo
  // eslint-disable-next-line
  const defaultGetter = hasDefault ? (type._def.defaultValue() as DefaultGetter) : null
  const description = input.type.description ?? null
  const types = input.type._def.options.map((_) => ({
    type: _,
    typePrimitiveKind: ZodHelpers.ZodPrimitiveToPrimitive[ZodHelpers.getZodPrimitive(input.type)],
  }))

  return {
    isOptional,
    defaultGetter,
    description,
    types,
  }
}
