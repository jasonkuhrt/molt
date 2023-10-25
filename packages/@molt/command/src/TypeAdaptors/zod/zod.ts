import { ZodHelpers } from '../../lib/zodHelpers/index.js'
import { Type } from '../../Type/index.js'
import { Alge } from 'alge'
import type { Simplify } from 'type-fest'
import type { z } from 'zod'

export * from './helpers.js'

// prettier-ignore
export type FromZod<ZodType extends z.ZodType> =
  ZodType extends z.ZodString                                           ? Type.Scalar.String :
  ZodType extends z.ZodBoolean                                          ? Type.Scalar.Boolean :
  ZodType extends z.ZodLiteral<infer T extends boolean|string|number>   ? Type.Scalar.Literal<T> :
  ZodType extends z.ZodNumber                                           ? Type.Scalar.Number :
  ZodType extends z.ZodEnum<infer T>                                    ? Type.Scalar.Enumeration<T> :
  ZodType extends z.ZodOptional<infer T>                                ? Type.Union<[{ type:FromZod<T>, description:null }, { type:Type.Literal<undefined>, description:null }]> :
  ZodType extends z.ZodDefault<infer T>                                 ? FromZod<T> :
  // ZodType extends z.ZodUnion<infer T>                                   ? Type.Union<T> :
  // ZodType extends z.ZodNativeEnum<infer T>                                    ? Type.Scalar.Enumeration<T[keyof T]> :
                                                                          never

// prettier-ignore
export const fromZod = (zodType: z.ZodFirstPartySchemaTypes): Type.Type => {
  const zt = zodType
  if (ZodHelpers.isString(zt)) {
    const checks = mapZodStringChecks(zt._def.checks)
    return Type.string(checks)
  }
  if (ZodHelpers.isNumber(zt)) {
    const checks = mapZodNumberChecks(zt._def.checks)
    return Type.number(checks)
  }
  if (ZodHelpers.isEnum(zt))            return Type.enumeration(zt._def.values)
  if (ZodHelpers.isNativeEnum(zt))      return Type.enumeration(zt._def.values)
  if (ZodHelpers.isBoolean(zt))         return Type.boolean()
  if (ZodHelpers.isLiteral(zt))         return Type.literal(zt._def.value)
  if (ZodHelpers.isDefault(zt))         return fromZod(zt._def.innerType)
  if (ZodHelpers.isOptional(zt))        return fromZod(zt._def.innerType)
  if (ZodHelpers.isUnion(zt))           {
    if (!Array.isArray(zt._def.options)) {
      throw new Error(`Unsupported zodType: ${JSON.stringify(zt[`_def`])}`)
    }
    return Type.union(
      zt._def.options.map(_ => {
        return {
          description: null, // todo forward from zod
          type: fromZod(_)
        }
      })
    )
  }
  console.log(zt)
  throw new Error(`Unsupported zodType: ${JSON.stringify(zt[`_def`])}`)
}

const mapZodNumberChecks = (checks: z.ZodNumberCheck[]) => {
  return checks.reduce(
    (acc, check) => {
      return Alge.match(check)
        .int(() => ({ ...acc, int: true }))
        .min((check) => ({
          min: check.value,
        }))
        .max((check) => ({
          max: check.value,
        }))
        .finite(() => ({
          finite: true,
        }))
        .multipleOf((check) => ({
          multipleOf: check.value,
        }))
        .done()
    },
    {} as Simplify<Omit<Type.Scalar.Number, '_tag'>>,
  )
}

const mapZodStringChecks = (checks: z.ZodStringCheck[]): Omit<Type.Scalar.String, '_tag'> => {
  return checks.reduce(
    (acc, check) => {
      return {
        ...acc,
        ...Alge.match(check)
          .regex((check) => ({
            regex: check.regex,
          }))
          .min((check) => ({
            min: check.value,
          }))
          .max((check) => ({
            max: check.value,
          }))
          .url((check) => ({
            pattern: { type: check.kind },
          }))
          .cuid((check) => ({
            pattern: { type: check.kind },
          }))
          .cuid2(() => ({
            pattern: { type: `cuid2` as const },
          }))
          .uuid((check) => ({
            pattern: { type: check.kind },
          }))
          .emoji((_) => ({
            pattern: { type: _.kind },
          }))
          .ip((_) => ({
            pattern: {
              type: _.kind,
              version: _.version
                ? Alge.match(_.version)
                    .v4(() => 4 as const)
                    .v6(() => 6 as const)
                    .done()
                : null,
            },
          }))
          .ulid((_) => ({
            pattern: { type: _.kind },
          }))
          .datetime((check) => ({
            pattern: {
              type: `dateTime` as const,
              offset: check.offset,
              precision: check.precision,
            },
          }))
          .email((check) => ({
            pattern: { type: check.kind },
          }))
          .endsWith((check) => ({
            endsWith: check.value,
          }))
          .startsWith((check) => ({
            startsWith: check.value,
          }))
          .length((check) => ({
            length: check.value,
          }))
          .includes((_) => ({
            includes: _.value,
          }))
          // transformations
          .trim(() => ({
            transformations: {
              ...acc.transformations,
              trim: true,
            },
          }))
          .toLowerCase(() => ({
            transformations: {
              ...acc.transformations,
              toCase: `lower` as const,
            },
          }))
          .toUpperCase(() => ({
            transformations: {
              ...acc.transformations,
              toCase: `upper` as const,
            },
          }))
          .done(),
      }
    },
    {} as Simplify<Omit<Type.Scalar.String, '_tag'>>,
  )
}
