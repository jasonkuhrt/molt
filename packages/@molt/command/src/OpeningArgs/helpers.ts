import type { CommandParameter } from '../CommandParameter/index.js'
import { BooleanLookup, negateNamePattern, parseEnvironmentVariableBoolean } from '../helpers.js'
import type { Pam } from '../lib/Pam/index.js'
import type { Value } from './types.js'
import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'
import { z } from 'zod'

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

export const zodPassthrough = <T>() => z.any().transform((_) => _ as T)

// prettier-ignore
export const parseRawInput = (name: string, rawValue: string, spec: CommandParameter.Output): Value => {
  const parsedValue = parseRawValue(rawValue, spec.type)
  if (parsedValue === null) {
    const expectedTypes = spec.type._tag
    throw new Error(`Failed to parse input ${name} with value ${rawValue}. Expected type of ${expectedTypes}.`)
  }
  if (typeof parsedValue === `string`) return { _tag: `string`, value: parsedValue }
  if (typeof parsedValue === `number`) return { _tag: `number`, value: parsedValue }
  if (typeof parsedValue === `boolean`){
  // dump(isEnvarNegated(name, spec))
  return { _tag: `boolean`, value: parsedValue, negated: isEnvarNegated(name, spec) }
  }
  return casesHandled(parsedValue)
}

const casesHandled = (value: never): never => {
  throw new Error(`Unhandled case ${String(value)}`)
}

/**
 * Is the environment variable input negated? Unlike line input the environment can be
 * namespaced so a bit more work is needed to parse out the name pattern.
 */
export const isEnvarNegated = (name: string, spec: CommandParameter.Output): boolean => {
  const nameWithNamespaceStripped = stripeNamespace(name, spec)
  // dump({ nameWithNamespaceStripped })
  return negateNamePattern.test(nameWithNamespaceStripped)
}

export const isNegated = (name: string): boolean => {
  return negateNamePattern.test(name)
}

const stripeNamespace = (name: string, spec: CommandParameter.Output): string => {
  for (const namespace of spec.environment?.namespaces ?? []) {
    if (name.startsWith(namespace)) return camelCase(name.slice(namespace.length))
  }
  return name
}

/**
 * For a union we infer the value to be the type of the first variant type that matches.
 * This means that variant order matters since there are sub/super type relationships.
 * For example a number is a subset of string type. If there is a string and number variant
 * we should first check if the value could be a number, than a string.
 */
const variantOrder: Pam.Type['_tag'][] = [`TypeNumber`, `TypeBoolean`, `TypeString`, `TypeEnum`, `TypeUnion`]

export const parseRawValue = (value: string, type: Pam.Type): null | boolean | number | string => {
  return Alge.match(type)
    .TypeLiteral((t) => parseLiteral(t, value))
    .TypeString(() => value)
    .TypeEnum((t) => parseEnum(t, value))
    .TypeBoolean(() => parseEnvironmentVariableBoolean(value))
    .TypeNumber(() => {
      const result = Number(value)
      return isNaN(result) ? null : result
    })
    .TypeUnion((t) => {
      return (
        t.members
          .sort((a, b) => variantOrder.indexOf(a.type._tag) - variantOrder.indexOf(b.type._tag))
          .map((m) => parseRawValue(value, m.type))
          .find((m) => m !== null) ?? null
      )
    })
    .done()
}

/**
 * Enums can be given a base type of numbers or strings. Examples:
 *
 * - number: `z.nativeEnum(\{ a: 1, b: 2\})`
 * - string: `z.enum(['a','b','c'])`
 *
 * It is not possible to have an enum that mixes numbers and strings.
 *
 * When we receive a raw value, we infer its base  type based on checking the type first member of the enum.
 */
export const parseEnum = (spec: Pam.Type.Scalar.Enumeration, value: string): string | number => {
  const isNumberEnum = spec.members.find((_) => typeof _ === `number`)
  if (isNumberEnum) return Number(value)
  return value
}

export const parseLiteral = (spec: Pam.Type.Scalar.Literal, value: string): boolean | string | number => {
  if (typeof spec.value === `string`) return value
  if (typeof spec.value === `number`) return Number(value)
  if (typeof spec.value === `boolean`) {
    const v = (BooleanLookup as Record<string, boolean>)[value]
    if (!v) throw new Error(`Invalid boolean literal value: ${value}`)
    return v
  }
  return casesHandled(spec.value)
}
