import { Errors } from '../Errors/index.js'
import type { Spec } from '../ParameterSpec/ParametersSpec.js'
import { Environment } from './Environment/index.js'
import { Line } from './Line/index.js'

export * from './types.js'

export const parseOrThrow = (
  specs: Spec[],
  rawLineInputs: Line.RawLineInputs
): { args: Record<string, unknown>; errors: Errors.ErrorMissingArgument[] } => {
  const errors = []
  const env = Environment.parse(specs)
  const line = Line.parse(rawLineInputs, specs)
  const args: Record<string, unknown> = {}

  // dump({ specs })
  // dump({ line })
  // dump({ env })

  for (const spec of specs) {
    const input = line[spec.name.canonical] ?? env[spec.name.canonical]

    if (input) {
      if (input.errors.length > 0) {
        // TODO aggregate error
        throw input.errors[0]
      }
      if (input.duplicates.length > 0) {
        throw new Error(`Duplicate input for parameter ${spec.name.canonical}`)
      }

      if (input.value._tag === `boolean`) {
        args[spec.name.canonical] = input.value.negated ? !input.value.value : input.value.value
      } else {
        const value = input.spec.schema.safeParse(input.value.value)
        if (!value.success) {
          throw new Error(`Invalid value for ${spec.name.canonical}: todo`)
        }
        args[spec.name.canonical] = value.data
      }
      continue
    }

    if (spec.default) {
      args[spec.name.canonical] = spec.default.get()
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
