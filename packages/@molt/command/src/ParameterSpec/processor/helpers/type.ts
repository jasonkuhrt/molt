import type { ZodNumberCheck, ZodStringCheck } from '../../../lib/zodHelpers/index_.js'
import type { SomeBasicType, Type } from '../../types.js'
import { getBasicScalar } from '../../types.js'
import { Alge } from 'alge'
import type { z } from 'zod'

export const analyzeZodTypeScalar = (zodType: SomeBasicType) => {
  let description = zodType.description ?? null
  let primitiveType = zodType

  while (primitiveType._def.typeName === `ZodDefault` || primitiveType._def.typeName === `ZodOptional`) {
    description = description ?? primitiveType._def.innerType.description ?? null
    primitiveType = primitiveType._def.innerType
  }

  const zodTypeScalar = getBasicScalar(primitiveType)

  const type: Type =
    zodTypeScalar._def.typeName === `ZodString`
      ? { _tag: `TypeString`, ...mapZodStringChecks(zodTypeScalar._def.checks) }
      : zodTypeScalar._def.typeName === `ZodBoolean`
      ? { _tag: `TypeBoolean` }
      : zodTypeScalar._def.typeName === `ZodNumber`
      ? { _tag: `TypeNumber`, ...mapZodNumberChecks(zodTypeScalar._def.checks) }
      : { _tag: `TypeEnum`, members: zodTypeScalar._def.values }

  return {
    description,
    type,
  }
}

const mapZodNumberChecks = (checks: z.ZodNumberCheck[]) => {
  return checks
    .map((_): ZodNumberCheck => ({ _tag: _.kind, ..._ } as any))
    .reduce((acc, check) => {
      return (
        Alge.match(check)
          .int(() => ({ ...acc, int: true }))
          // TODO all zod check mappings
          .else(acc)
      )
    }, {})
}

const mapZodStringChecks = (checks: z.ZodStringCheck[]) => {
  return checks
    .map((_): ZodStringCheck => ({ _tag: _.kind, ..._ } as any))
    .reduce((acc, check) => {
      return (
        Alge.match(check)
          .regex((check) => ({
            ...acc,
            regex: check.regex,
          }))
          // TODO all zod check mappings
          .else(acc)
      )
    }, {})
}
