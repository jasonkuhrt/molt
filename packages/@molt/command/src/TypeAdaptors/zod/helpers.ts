import type {
  SomeBasicType,
  SomeType,
  SomeUnionType,
  SomeUnionTypeScalar,
} from '../../CommandParameter/types.js'
import { ZodHelpers } from '../../lib/zodHelpers/index.js'
import { type ZodNumberCheck, type ZodStringCheck } from '../../lib/zodHelpers/index_.js'
import type { Type } from '../../Type/index.js'
import { Alge } from 'alge'
import { z } from 'zod'

export const analyzeZodType = (zodType: SomeType) => {
  return analyzeZodType_(zodType, zodType.description ?? null)
}

// prettier-ignore
type ZodTypeToType<ZT extends SomeBasicType | SomeUnionType> =
  ZT extends z.ZodOptional<infer T>       ? ZodTypeToType<T> :
  ZT extends z.ZodDefault<infer T>        ? ZodTypeToType<T> :
  ZT extends z.ZodLiteral<any>            ? Type.Scalar.Literal :
  ZT extends z.ZodString                  ? Type.Scalar.String :
  ZT extends z.ZodBoolean                 ? Type.Scalar.Boolean :
  ZT extends z.ZodNumber                  ? Type.Scalar.Number :
  ZT extends z.ZodEnum<any>               ? Type.Scalar.Enumeration :
  ZT extends z.ZodNativeEnum<any>         ? Type.Scalar.Enumeration :
  ZT extends z.ZodUnion<any>              ? Type.Union :
                                            never

const analyzeZodType_ = <ZT extends SomeType>(
  zodType: ZT,
  description: null | string,
): {
  type: ZodTypeToType<ZT>
  // type: ZT
  description: null | string
} => {
  if (zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault) {
    return analyzeZodType_(zodType._def.innerType as ZT, description)
  }

  if (zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional) {
    return analyzeZodType_(zodType._def.innerType as ZT, description)
  }

  // @ts-expect-error todo
  const type: null | Type.Type = ZodHelpers.isUnion(zodType)
    ? analyzeZodUnionType(zodType)
    : ZodHelpers.isLiteral(zodType)
    ? { _tag: `TypeLiteral`, value: zodType._def.value }
    : ZodHelpers.isString(zodType)
    ? { _tag: `TypeString`, ...mapZodStringChecks(zodType._def.checks) }
    : zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodBoolean
    ? { _tag: `TypeBoolean` }
    : ZodHelpers.isNumber(zodType)
    ? { _tag: `TypeNumber`, ...mapZodNumberChecks(zodType._def.checks) }
    : ZodHelpers.isNativeEnum(zodType)
    ? { _tag: `TypeEnum`, members: Object.values(zodType._def.values) }
    : ZodHelpers.isEnum(zodType)
    ? { _tag: `TypeEnum`, members: zodType._def.values }
    : null

  if (!type) throw new Error(`Unsupported zod type: ${zodType._def.typeName}`)

  return {
    description,
    type: type as ZodTypeToType<ZT>,
  }
}

export const analyzeZodUnionType = (zodType: SomeUnionTypeScalar) => {
  return {
    _tag: `TypeUnion` as const,
    members: zodType._def.options.map((_) => {
      return analyzeZodType(_)
      // const typeAnalysis = analyzeZodType(_)
      // return {
      //   // zodType: _,
      //   description: typeAnalysis.description,
      //   type: typeAnalysis.type,
      // }
    }),
  }
}

const mapZodNumberChecks = (checks: z.ZodNumberCheck[]) => {
  return checks
    .map((_): ZodNumberCheck => ({ _tag: _.kind, ..._ }) as any)
    .reduce(
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
      {} as Omit<Type.Scalar.Number, '_tag'>,
    )
}

const mapZodStringChecks = (checks: z.ZodStringCheck[]): Omit<Type.Scalar.String, '_tag'> => {
  return checks
    .map((_): ZodStringCheck => ({ _tag: _.kind, ..._ }) as any)
    .reduce<Omit<Type.Scalar.String, '_tag'>>(
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
              pattern: { type: check._tag },
            }))
            .cuid((check) => ({
              pattern: { type: check._tag },
            }))
            .cuid2(() => ({
              pattern: { type: `cuid2` as const },
            }))
            .uuid((check) => ({
              pattern: { type: check._tag },
            }))
            .emoji((_) => ({
              pattern: { type: _._tag },
            }))
            .ip((_) => ({
              pattern: {
                type: _._tag,
                version: _.version
                  ? Alge.match(_.version)
                      .v4(() => 4 as const)
                      .v6(() => 6 as const)
                      .done()
                  : null,
              },
            }))
            .ulid((_) => ({
              pattern: { type: _._tag },
            }))
            .datetime((check) => ({
              pattern: {
                type: `dateTime` as const,
                offset: check.offset,
                precision: check.precision,
              },
            }))
            .email((check) => ({
              pattern: { type: check._tag },
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
      {} as Omit<Type.Scalar.String, '_tag'>,
    )
}
