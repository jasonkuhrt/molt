export const defaultParameterNamePrefixes = [`CLI_PARAMETER`, `CLI_PARAM`] as const

export const environmentArgumentName = (name: string) => `${defaultParameterNamePrefixes[0]}_${name}`

export const getProcessEnvironmentLowerCase = () =>
  Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k.toLowerCase(), v?.trim()]))

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
