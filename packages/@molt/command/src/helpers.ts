import type { Value } from './Args/types.js'
import type { ParameterSpec } from './ParameterSpec/index.js'
import { Alge } from 'alge'
import camelCase from 'lodash.camelcase'
import { z } from 'zod'

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

export const zodPassthrough = <T>() => z.any().transform((_) => _ as T)

export type Values<T> = T[keyof T]

export const getLowerCaseEnvironment = (): NodeJS.ProcessEnv => lowerCaseObjectKeys(process.env)

export const lowerCaseObjectKeys = (obj: object) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]))

// prettier-ignore
export const parseRawInput = (name: string, rawValue: string, spec: ParameterSpec.Output): Value => {
  const parsedValue = parseRawValue(rawValue, spec)
  if (parsedValue === null) {
    const expectedTypes = Alge.match(spec).Union((spec) => spec.types.map(_=>_.type._tag).join(` | `)).else(spec => spec.type._tag)
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
export const isEnvarNegated = (name: string, spec: ParameterSpec.Output): boolean => {
  const nameWithNamespaceStripped = stripeNamespace(name, spec)
  // dump({ nameWithNamespaceStripped })
  return negateNamePattern.test(nameWithNamespaceStripped)
}

export const isNegated = (name: string): boolean => {
  return negateNamePattern.test(name)
}

const stripeNamespace = (name: string, spec: ParameterSpec.Output): string => {
  for (const namespace of spec.environment?.namespaces ?? []) {
    if (name.startsWith(namespace)) return camelCase(name.slice(namespace.length))
  }
  return name
}

export const parseRawValue = (
  value: string,
  spec: ParameterSpec.Output
): null | boolean | number | string => {
  return Alge.match(spec)
    .Union((spec) => {
      /**
       * For a union we infer the value to be the type of the first variant type that matches.
       * This means that variant order matters since there are sub/super type relationships.
       * For example a number is a subset of string type. If there is a string and number variant
       * we should first check if the value could be a number, than a string.
       */
      const variantOrder: ParameterSpec.Type['_tag'][] = [
        `TypeNumber`,
        `TypeBoolean`,
        `TypeString`,
        `TypeEnum`,
      ]
      const types = spec.types.sort(
        (a, b) => variantOrder.indexOf(a.type._tag) - variantOrder.indexOf(b.type._tag)
      )
      return (
        types
          .map((_) =>
            Alge.match(_.type)
              .TypeString(() => value)
              .TypeEnum(() => value)
              .TypeBoolean(() => parseEnvironmentVariableBoolean(value))
              .TypeNumber(() => {
                const result = Number(value)
                return isNaN(result) ? null : result
              })
              .done()
          )
          .find((parsedValue) => parsedValue !== null) ?? null
      )
    })
    .else((spec) =>
      Alge.match(spec.type)
        .TypeString(() => value)
        .TypeEnum(() => value)
        .TypeBoolean(() => parseEnvironmentVariableBoolean(value))
        .TypeNumber(() => Number(value))
        .done()
    )
}

export const environmentVariableBooleanLookup = {
  '1': true,
  '0': false,
  true: true,
  false: false,
} as const

export const parseEnvironmentVariableBoolean = (value: string): boolean | null =>
  // @ts-expect-error ignore
  // eslint-disable-next-line
  environmentVariableBooleanLookup[value] ?? null

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

export const invertTable = <T>(rows: T[][]): T[][] => {
  const columns: T[][] = []
  for (const row of rows) {
    let i = 0
    for (const col of row) {
      const column = columns[i] || []
      column.push(col)
      columns[i] = column
      i++
    }
  }
  return columns
}
