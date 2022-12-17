export * from './input.js'
export * from './output.js'
export * from './processor/process.js'
export * from './types.js'
import { stripeNegatePrefix } from '../helpers.js'
import type { Output, PrimitiveKind } from './output.js'

export const findByName = (name: string, specs: Output[]): null | Output => {
  for (const spec of specs) {
    const result = hasName(spec, name)
    if (result !== null) return spec
  }
  return null
}
/**
 * Get all the names of a parameter in array form.
 */
export const getNames = (spec: Output): [string, ...string[]] => {
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
export const hasName = (spec: Output, name: string): null | NameHit => {
  const result = parameterSpecHasNameDo(spec, name, false)

  if (isOrHasPrimitiveKind(spec, `boolean`)) {
    const nameWithoutNegatePrefix = stripeNegatePrefix(name)
    if (nameWithoutNegatePrefix) {
      return parameterSpecHasNameDo(spec, nameWithoutNegatePrefix, true)
    }
  }

  return result
}

const isOrHasPrimitiveKind = (spec: Output, primitiveKind: PrimitiveKind): boolean => {
  return spec._tag === `Union`
    ? spec.types.find((_) => _.typePrimitiveKind === primitiveKind) !== null
    : spec.typePrimitiveKind === primitiveKind
}

const parameterSpecHasNameDo = (
  spec: Output,
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
