import type { Value } from './Input/types.js'
import type { ParameterSpec } from './ParameterSpec/index.js'
import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

export const getLowerCaseEnvironment = () =>
  Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k.toLowerCase(), v?.trim()]))

// prettier-ignore
export const parseRawInput = (name: string, rawValue: string, spec: ParameterSpec.Spec): Value => {
  const parsedValue = parseRawValue(rawValue, spec)
  if (parsedValue === null) throw new Error(`Failed to parse input ${name} with value ${rawValue}. Expected type of ${spec.schemaPrimitive}.`)
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
export const isEnvarNegated = (name: string, spec: ParameterSpec.Spec): boolean => {
  const nameWithNamespaceStripped = stripeNamespace(name, spec)
  // dump({ nameWithNamespaceStripped })
  return negateNamePattern.test(nameWithNamespaceStripped)
}

export const isNegated = (name: string): boolean => {
  return negateNamePattern.test(name)
}

const stripeNamespace = (name: string, spec: ParameterSpec.Spec): string => {
  for (const namespace of spec.environment?.namespaces ?? []) {
    if (name.startsWith(namespace)) return camelCase(name.slice(namespace.length))
  }
  return name
}

export const parseRawValue = (value: string, spec: ParameterSpec.Spec): boolean | number | null | string => {
  return Alge.match(spec.schemaPrimitive)
    .string(() => value)
    .boolean(() => parseEnvironmentVariableBoolean(value))
    .number(() => Number(value))
    .done()
}

export const parseEnvironmentVariableBoolean = (value: string) =>
  value === `true` ? true : value === `false` ? false : null

export const parseEnvironmentVariableBooleanOrThrow = (value: string) => {
  const result = parseEnvironmentVariableBoolean(value)
  if (result === null) {
    throw new Error(`Invalid boolean value: ${value}`)
  }
  return result
}

export const negateNamePattern = /^no([A-Z].+)/

export const stripeNegatePrefix = (name: string): null | string => {
  // eslint-disable-next-line
  const withoutPrefix = name.match(negateNamePattern)?.[1]!
  if (!withoutPrefix) return null
  const withCamelCase = camelCase(withoutPrefix)
  return withCamelCase
}

export const stripeNegatePrefixLoose = (name: string): string => {
  const result = stripeNegatePrefix(name)
  return result ? result : name
}

import type { FlagName } from '@molt/types'
import type { z } from 'zod'

export type SomeSchema = z.ZodRawShape

// prettier-ignore
export type FlagSpecExpressionParseResultToPropertyName<result extends FlagName.Types.SomeParseResult> = 
	FlagName.Errors.$Is<result> extends true 		? result :
	result extends { long: string } 						? result['long'] :
	result extends { short: string} 						? result['short'] :
																							  never
