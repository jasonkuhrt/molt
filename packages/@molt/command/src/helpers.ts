import { Either } from 'effect'
import camelCase from 'lodash.camelcase'
import { z } from 'zod'

export const BooleanLookup = {
  true: true,
  false: false,
} as const

export const environmentVariableBooleanLookup = {
  ...BooleanLookup,
  '1': true,
  '0': false,
} as const

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

export const zodPassthrough = <T>() => z.any().transform((_) => _ as T)

export type Values<T> = T[keyof T]

export const getLowerCaseEnvironment = (): NodeJS.ProcessEnv => lowerCaseObjectKeys(process.env)

export const lowerCaseObjectKeys = (obj: object) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]))

export const parseEnvironmentVariableBoolean = (serializedValue: string): Either.Either<Error, boolean> => {
  // @ts-expect-error ignore
  // eslint-disable-next-line
  const value = environmentVariableBooleanLookup[serializedValue]
  if (value === undefined) return Either.left(new Error(`Invalid boolean value: ${value}`))
  return Either.right(value)
}

export const parseEnvironmentVariableBooleanOrThrow = (value: string) => {
  const result = parseEnvironmentVariableBoolean(value)
  if (Either.isLeft(result)) {
    throw result.left
  }
  return result.right
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

export const entries = <O extends object>(
  obj: O,
): Exclude<{ [k in keyof O]: [k, O[k]] }[keyof O], undefined>[] => Object.entries(obj) as any

export const casesExhausted = (_: never): never => {
  throw new Error(`Cases exhausted: ${_}`) // eslint-disable-line
}
