import { Errors } from '../Errors/index.js'
import type { Spec } from '../ParameterSpec/ParametersSpec.js'
import { Environment } from './Environment/index.js'
import { Line } from './Line/index.js'

export { Environment } from './Environment/index.js'
export { Line } from './Line/index.js'
export * from './types.js'

export const parse = (
  specs: Spec[],
  rawLineInputs: Line.RawInputs,
  rawEnvironmentInputs: Environment.RawInputs
): { args: Record<string, unknown>; errors: Errors.ErrorMissingArgument[] } => {
  const errors = []
  const args: Record<string, unknown> = {}
  const env = Environment.parse(rawEnvironmentInputs, specs)
  const lineParseResult = Line.parse(rawLineInputs, specs)

  if (lineParseResult.errors.length > 0) errors.push(...lineParseResult.errors)

  // dump({ specs })
  // dump({ line })
  // dump({ env })

  for (const spec of specs) {
    const input = lineParseResult.line[spec.name.canonical] ?? env[spec.name.canonical]

    if (input) {
      if (input.errors.length > 0) {
        errors.push(...input.errors)
        continue
      }
      if (input.duplicates.length > 0) {
        errors.push(new Error(`Duplicate input for parameter ${spec.name.canonical}`))
        continue
      }

      if (input.value._tag === `boolean`) {
        args[spec.name.canonical] = input.value.negated ? !input.value.value : input.value.value
      } else {
        let value: unknown
        try {
          value = input.spec.schema.parse(input.value.value)
        } catch (e) {
          errors.push(new Error(`Invalid value for ${spec.name.canonical}`, { cause: e }))
          args[spec.name.canonical] = undefined
          continue
        }
        args[spec.name.canonical] = value
      }
      continue
    }

    if (spec.default) {
      try {
        args[spec.name.canonical] = spec.default.get()
      } catch (error) {
        errors.push(new Error(`Failed to get default value for ${spec.name.canonical}`, { cause: error }))
        args[spec.name.canonical] = undefined
      }
      continue
    }

    if (!spec.optional) {
      errors.push(new Errors.ErrorMissingArgument({ spec }))
    }

    args[spec.name.canonical] = undefined
  }

  // dump({ args })
  return { args, errors }
}
