import { Alge } from 'alge'

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
