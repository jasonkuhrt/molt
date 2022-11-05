export * from './input.js'
export * from './normalized.js'
export * from './parse.js'
import { stripeNegatePrefix } from '../helpers.js'
import type { Input } from './input.js'
import type { Normalized } from './normalized.js'
import type { z } from 'zod'

export type SomeExclusiveZodType = z.ZodString | z.ZodEnum<[string, ...string[]]> | z.ZodNumber | z.ZodBoolean

export type SomeBasicZodType =
  | z.ZodString
  | z.ZodEnum<[string, ...string[]]>
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodOptional<z.ZodString | z.ZodBoolean | z.ZodNumber | z.ZodEnum<[string, ...string[]]>>
  | z.ZodDefault<z.ZodString | z.ZodBoolean | z.ZodNumber | z.ZodEnum<[string, ...string[]]>>

export type SomeInputs = Record<string, Input>

export const findByName = (name: string, specs: Normalized[]): null | Normalized => {
  for (const spec of specs) {
    const result = hasName(spec, name)
    if (result !== null) return spec
  }
  return null
}
/**
 * Get all the names of a parameter in array form.
 */
export const getNames = (spec: Normalized): [string, ...string[]] => {
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
export const hasName = (spec: Normalized, name: string): null | NameHit => {
  const result = parameterSpecHasNameDo(spec, name, false)

  if (spec.typePrimitiveKind === `boolean`) {
    const nameWithoutNegatePrefix = stripeNegatePrefix(name)
    if (nameWithoutNegatePrefix) {
      return parameterSpecHasNameDo(spec, nameWithoutNegatePrefix, true)
    }
  }

  return result
}

const parameterSpecHasNameDo = (
  spec: Normalized,
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
