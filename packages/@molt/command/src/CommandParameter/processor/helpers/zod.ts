import type { Pam } from '../../../lib/Pam/index.js'
import type { ZodNumberCheck, ZodStringCheck } from '../../../lib/zodHelpers/index_.js'
import type { SomeBasicType, SomeUnionType, TypeNumber, TypeString } from '../../types.js'
import { Alge } from 'alge'
import { z } from 'zod'

// export const analyzeZodType = (zodType: SomeBasicType | SomeUnionType) => {
//   if (zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodUnion) {
//     let description = zodType.description ?? null
//     let primitiveType = zodType

//     while (
//       primitiveType._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault ||
//       primitiveType._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional
//     ) {
//       description = description ?? primitiveType._def.innerType.description ?? null
//       primitiveType = primitiveType._def.innerType
//     }

//     const members = zodType._def.options.map((_) => {
//       const typeAnalysis = analyzeZodTypeScalar(_)
//       return {
//         // zodType: _,
//         description: typeAnalysis.description,
//         type: typeAnalysis.type,
//       }
//     })
//     return {
//       _tag: `TypeUnion`,
//       members,
//     }
//   }

//   return analyzeZodTypeScalar(zodType)
// }

export const analyzeZodType = (zodType: SomeBasicType | SomeUnionType) => {
  return analyzeZodType_(zodType, zodType.description ?? null)
}

// prettier-ignore
type ZodTypeToType<ZT extends SomeBasicType | SomeUnionType> =
  ZT extends z.ZodOptional<infer T>       ? ZodTypeToType<T> :
  ZT extends z.ZodDefault<infer T>        ? ZodTypeToType<T> :
  ZT extends z.ZodLiteral<any>            ? Pam.Type.Literal :
  ZT extends z.ZodString                  ? Pam.Type.String :
  ZT extends z.ZodBoolean                 ? Pam.Type.Boolean :
  ZT extends z.ZodNumber                  ? Pam.Type.Number :
  ZT extends z.ZodEnum<any>               ? Pam.Type.Enumeration :
  ZT extends z.ZodNativeEnum<any>         ? Pam.Type.Enumeration :
  ZT extends z.ZodUnion<any>              ? Pam.Type.Union :
                                            never

const analyzeZodType_ = <ZT extends SomeBasicType | SomeUnionType>(
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

  const type: null | Pam.Type.Group.Any =
    zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodUnion
      ? {
          _tag: `TypeUnion` as const,
          members: zodType._def.options.map((_) => {
            const typeAnalysis = analyzeZodType(_)
            return {
              // zodType: _,
              description: typeAnalysis.description,
              type: typeAnalysis.type,
            }
          }),
        }
      : zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodLiteral
      ? { _tag: `TypeLiteral`, value: zodType._def.value }
      : zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodString
      ? { _tag: `TypeString`, ...mapZodStringChecks(zodType._def.checks) }
      : zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodBoolean
      ? { _tag: `TypeBoolean` }
      : zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodNumber
      ? { _tag: `TypeNumber`, ...mapZodNumberChecks(zodType._def.checks) }
      : zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodNativeEnum
      ? { _tag: `TypeEnum`, members: Object.values(zodType._def.values) }
      : zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodEnum
      ? { _tag: `TypeEnum`, members: zodType._def.values }
      : null

  if (!type) throw new Error(`Unsupported zod type: ${zodType._def.typeName}`)

  return {
    description,
    type: type as ZodTypeToType<ZT>,
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
      {} as Omit<TypeNumber, '_tag'>,
    )
}

const mapZodStringChecks = (checks: z.ZodStringCheck[]): Omit<TypeString, '_tag'> => {
  return checks
    .map((_): ZodStringCheck => ({ _tag: _.kind, ..._ }) as any)
    .reduce<Omit<TypeString, '_tag'>>(
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
      {} as Omit<TypeString, '_tag'>,
    )
}
