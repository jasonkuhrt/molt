import { Alge } from 'alge'

export const getProcessEnvironmentLowerCase = () =>
  Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k.toLowerCase(), v?.trim()]))

export const stripeDashPrefix = (flagNameInput: string): string => {
  return flagNameInput.replace(/^-+/, ``)
}

export const lookupEnvironmentVariableArgument = (
  prefixes: readonly string[],
  environment: Record<string, string | undefined>,
  parameterName: string
): null | { name: string; value: string } => {
  const args = prefixes
    .map((prefix) => `${prefix.toLowerCase()}_${parameterName.toLowerCase()}`)
    .map((name) => ({ name, value: environment[name] }))
    .filter((arg): arg is { name: string; value: string } => arg.value !== undefined)

  if (args.length === 0) return null

  if (args.length > 1)
    throw new Error(
      `Multiple environment variables found for same parameter "${parameterName}": ${args.join(`, `)}`
    )

  // eslint-disable-next-line
  const environmentVariable = args[0]!
  return environmentVariable
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
