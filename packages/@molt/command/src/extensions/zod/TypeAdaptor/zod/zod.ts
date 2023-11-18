import { Type } from '../../../../Type/index.js'
import { ZodHelpers } from '../../zodHelpers/index.js'
import { Alge } from 'alge'
import type { Simplify } from 'type-fest'
import { z } from 'zod'

// prettier-ignore
export type FromZod<ZodType extends z.ZodType> =
  ZodType extends z.ZodOptional<infer T>
    ? Type.Union<[FromZodNonOptional<T>, Type.Literal<undefined>]>
    : FromZodNonOptional<ZodType>

// prettier-ignore
export type FromZodNonOptional<ZodType extends z.ZodType> =
  ZodType extends ZodTypeScalar              ? FromZodScalar<ZodType> :
  ZodType extends z.ZodDefault<infer T>      ? FromZodScalar<T> :
  ZodType extends z.ZodUnion<infer T>        ? Type.Union<{[i in keyof T]: FromZodScalar<T[i]>}> :
                                                never

// prettier-ignore
export type FromZodScalar<ZodType extends ZodTypeScalar> =
  ZodType extends z.ZodString                                           ? Type.Scalar.String :
  ZodType extends z.ZodBoolean                                          ? Type.Scalar.Boolean :
  ZodType extends z.ZodLiteral<infer T extends boolean|string|number>   ? Type.Scalar.Literal<T> :
  ZodType extends z.ZodNumber                                           ? Type.Scalar.Number :
  ZodType extends z.ZodEnum<infer T>                                    ? Type.Scalar.Enumeration<T> :
  ZodType extends z.ZodNativeEnum<infer T extends z.EnumLike>           ? Type.Scalar.Enumeration<EnumerationMembersFromZodEnumLike<T>> :
                                                                          never
type EnumerationMembersFromZodEnumLike<T extends z.EnumLike> = T[keyof T][]

type ZodTypeScalar =
  | z.ZodString
  | z.ZodBoolean
  | z.ZodLiteral<any>
  | z.ZodNumber
  | z.ZodEnum<any>
  | z.ZodNativeEnum<any>
// prettier-ignore

export const fromZod = (zodType: z.ZodFirstPartySchemaTypes): Type.Type => _fromZod(zodType, {})

// prettier-ignore
const _fromZod = (zodType: z.ZodFirstPartySchemaTypes,previous:{description?:string;optionality?:Type.Optionality<any>}): Type.Type => {
  const zt = zodType
  const description = previous.description ?? zt.description

  const isOptional = zt._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional
  const hasDefault = zt._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault
  const defaultGetter = hasDefault ? (zt._def.defaultValue as () => unknown) : null
  const optionality: Type.Optionality<any> = previous.optionality ?? (defaultGetter
    ? { _tag: `default`, getValue: () => defaultGetter() }
    : isOptional
    ? { _tag: `optional` }
    : { _tag: `required` })
  
  if (ZodHelpers.isString(zt)) {
    const {refinements,transformations} = mapZodStringChecksAndTransformations(zt._def.checks)
    return Type.string({ optionality, refinements, transformations, description })
  }
  if (ZodHelpers.isNumber(zt)) {
    const {refinements} = mapZodNumberChecksAndTransformations(zt._def.checks)
    return Type.number({ optionality, refinements, description })
  }
  if (ZodHelpers.isEnum(zt))            return Type.enumeration({ optionality, members: zt._def.values, description }) // eslint-disable-line
  if (ZodHelpers.isNativeEnum(zt))      return Type.enumeration({ optionality, members: Object.values<any>(zt._def.values), description })
  if (ZodHelpers.isBoolean(zt))         return Type.boolean({ optionality, description })
  if (ZodHelpers.isLiteral(zt))         return Type.literal({ optionality, value: zt._def.value, description }) // eslint-disable-line
  if (ZodHelpers.isDefault(zt))         return _fromZod(zt._def.innerType,{...previous,description,optionality})
  if (ZodHelpers.isOptional(zt))        return _fromZod(zt._def.innerType,{...previous,description,optionality})
  if (ZodHelpers.isUnion(zt))           {
    if (!Array.isArray(zt._def.options)) throw new Error(`Unsupported zodType: ${JSON.stringify(zt[`_def`])}`)
    const members = zt._def.options.map((_: {_def:{description:undefined|string}}) => {
      const description = _._def.description
      return _fromZod(_ as any, {...previous,description,optionality})
    })
    return Type.union({ optionality, members_: members, description })
  }
  throw new Error(`Unsupported zodType: ${JSON.stringify(zt[`_def`])}`)
}

const mapZodNumberChecksAndTransformations = (checks: z.ZodNumberCheck[]) => {
  return checks.reduce(
    (acc, check) => {
      return {
        refinements: {
          ...acc.refinements,
          ...Alge.match(check)
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
            .done(),
        },
      }
    },
    {} as Simplify<Pick<Type.Scalar.Number, 'refinements'>>,
  )
}

const mapZodStringChecksAndTransformations = (checks: z.ZodStringCheck[]) => {
  const transformations = [`trim`, `toCase`] as const
  return checks.reduce(
    (acc, check) => {
      const refinementOrTransformation = Alge.match(check)
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
          trim: true,
        }))
        .toLowerCase(() => ({
          toCase: `lower` as const,
        }))
        .toUpperCase(() => ({
          toCase: `upper` as const,
        }))
        .done()

      const isTransformation = transformations.includes(Object.keys(refinementOrTransformation)[0]! as any)
      return isTransformation
        ? {
            ...acc,
            transformations: {
              ...acc.transformations,
              ...refinementOrTransformation,
            },
          }
        : {
            ...acc,
            refinements: {
              ...acc.refinements,
              ...refinementOrTransformation,
            },
          }
    },
    {} as Simplify<Pick<Type.Scalar.String, 'refinements' | 'transformations'>>,
  )
}
