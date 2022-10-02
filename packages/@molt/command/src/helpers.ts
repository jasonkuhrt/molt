import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'
import { inspect } from 'util'

export const dump = (...args: unknown[]) =>
  console.log(...args.map((arg) => inspect(arg, { depth: Infinity, colors: true })))

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

export const parsePrimitive = (
  value: string,
  parseTo: 'number' | 'string' | 'boolean'
): null | number | string | boolean =>
  Alge.match(parseTo)
    .boolean(() => parseEnvironmentVariableBoolean(value))
    .number(() => Number(value))
    .else(() => value)

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
