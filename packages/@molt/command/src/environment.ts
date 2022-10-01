import snakecase from 'lodash.snakecase'

export const defaultParameterNamePrefixes = [`CLI_PARAMETER`, `CLI_PARAM`]

export const environmentArgumentName = (name: string) => `${String(defaultParameterNamePrefixes[0])}_${name}`

export const getProcessEnvironmentLowerCase = () =>
  Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k.toLowerCase(), v?.trim()]))

export const lookupEnvironmentVariableArgument = (
  prefixes: string[],
  environment: Record<string, string | undefined>,
  parameterName: string
): null | { name: string; value: string } => {
  const parameterNameSnakeCase = snakecase(parameterName)
  const parameterNames =
    prefixes.length === 0
      ? [parameterNameSnakeCase]
      : // TODO add test coverage for the snake case conversion of a parameter name
        prefixes.map((prefix) => `${prefix.toLowerCase()}_${parameterNameSnakeCase.toLowerCase()}`)

  const args = parameterNames
    .map((name) => ({ name, value: environment[name] }))
    .filter((arg): arg is { name: string; value: string } => arg.value !== undefined)

  if (args.length === 0) return null

  if (args.length > 1)
    throw new Error(
      `Multiple environment variables found for same parameter "${parameterName}": ${args.join(`, `)}`
    )

  // dump(prefixes, environment, parameterName)

  // eslint-disable-next-line
  const environmentVariable = args[0]!
  return environmentVariable
}
