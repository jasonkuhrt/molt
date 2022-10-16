import { stripeDashPrefix, stripeNegatePrefix } from '../helpers.js'
import { partition } from '../lib/prelude.js'
import { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { Settings } from '../Settings/index.js'
import camelCase from 'lodash.camelcase'
import type { z } from 'zod'

/**
 * The normalized specification for a parameter.
 */
export interface Spec {
  schema: z.ZodType
  schemaPrimitive: ZodHelpers.Primitive
  optional: boolean
  description: string | null
  default: null | {
    get: () => unknown
  }
  environment: null | {
    enabled: boolean
    namespaces: Array<string>
  }
  name: {
    canonical: string
    aliases: {
      short: [...string[]]
      long: [...string[]]
    }
  } & ({ long: string; short: null } | { long: null; short: string } | { long: string; short: string })
}

export const parse = (schema: z.ZodRawShape, settings: Settings.Normalized): Spec[] =>
  Object.entries(schema).map(([expression, schema]) => {
    const names = expression
      .trim()
      .split(` `)
      .map((exp) => exp.trim())
      .map(stripeDashPrefix)
      .map(camelCase)
      .filter((exp) => exp.length > 0)

    const [shorts, longs] = partition(names, (name) => name.length > 1)

    // User should static error before hitting this at runtime thanks to
    // @molt/types.
    if (shorts.length === 0 && longs.length === 0) {
      throw new Error(`Invalid parameter expression: ${expression}`)
    }

    /**
     * Pick the first of both short/long groups as being the canonical forms of either group.
     * Then get the overall canonical name for the parameter.
     *
     * We've checked about that both groups are not empty. Therefore we know we will have at least
     * one name that thus satisfies the return type. Its tricky to convince TS of the union though
     * so we just use non-null type casts on all the following name values.
     */
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canonicalShort = (shorts.shift() ?? null)!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canonicalLong = (longs.shift() ?? null)!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canonical = (canonicalLong ?? canonicalShort)!

    // TODO check how to actually do this.
    const isOptional = ZodHelpers.isOptional(schema)

    // TODO check how to actually do this.
    // eslint-disable-next-line
    const hasDefault = typeof schema._def.defaultValue !== `undefined`

    const hasEnvironment =
      settings.parameters.environment[canonical]?.enabled ?? settings.parameters.environment.$default.enabled

    const spec: Spec = {
      schema,
      description: schema.description ?? null,
      optional: isOptional,
      default: hasDefault
        ? {
            // eslint-disable-next-line
            get: () => schema._def.defaultValue(),
          }
        : null,
      schemaPrimitive: ZodHelpers.ZodPrimitiveToPrimitive[ZodHelpers.getZodPrimitive(schema)],
      environment: hasEnvironment
        ? {
            enabled: hasEnvironment,
            namespaces: (
              settings.parameters.environment[canonical]?.prefix ??
              settings.parameters.environment.$default.prefix
            ).map((_) => camelCase(_)),
          }
        : null,
      name: {
        canonical: canonical,
        long: canonicalLong,
        short: canonicalShort,
        aliases: {
          long: longs,
          short: shorts,
        },
      },
    }

    return spec
  })

export const findByName = (name: string, specs: Spec[]): null | Spec => {
  for (const spec of specs) {
    const result = hasName(spec, name)
    if (result !== null) return spec
  }
  return null
}
/**
 * Get all the names of a parameter in array form.
 */
export const getNames = (spec: Spec): [string, ...string[]] => {
  return [
    ...spec.name.aliases.long,
    ...spec.name.aliases.short,
    ...(spec.name.long === null ? [] : [spec.name.long]),
    ...(spec.name.short === null ? [] : [spec.name.short]),
  ] as [string, ...string[]]
}

type NameHit =
  | {
      kind: 'long' | 'longAlias'
      /**
       * Was the given name in negated format? e.g. noFoo instead of foo
       */
      negated: boolean
    }
  | {
      kind: 'short' | 'shortAlias'
    }

/**
 * Is one of the parameter's names the given name?
 */
export const hasName = (spec: Spec, name: string): null | NameHit => {
  const result = parameterSpecHasNameDo(spec, name, false)

  if (spec.schemaPrimitive === `boolean`) {
    const nameWithoutNegatePrefix = stripeNegatePrefix(name)
    if (nameWithoutNegatePrefix) {
      return parameterSpecHasNameDo(spec, nameWithoutNegatePrefix, true)
    }
  }

  return result
}

const parameterSpecHasNameDo = (
  spec: Spec,
  name: string,
  negated: boolean
): null | { kind: 'long' | 'longAlias'; negated: boolean } | { kind: 'short' | 'shortAlias' } => {
  return spec.name.long === name
    ? { kind: `long`, negated }
    : spec.name.aliases.long.includes(name)
    ? { kind: `longAlias`, negated }
    : // Short names cannot be negated currently so short circuit with the negated check.
    spec.name.short === name
    ? { kind: `short` }
    : spec.name.aliases.short.includes(name)
    ? { kind: `shortAlias` }
    : null
}
