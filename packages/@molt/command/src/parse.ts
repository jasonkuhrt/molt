import { Environment } from './Environment/index.js'
import { Errors } from './Errors/index.js'
import { Line } from './Line/index.js'
import { ParameterSpec } from './ParameterSpec/index.js'
import type { Normalized } from './Settings/settings.js'
import type { z } from 'zod'

export const parseProcessArguments = (
  schema: z.ZodRawShape,
  rawLineInputs: Line.RawLineInputs,
  settings: Normalized
): object => {
  const specs = ParameterSpec.parse(schema, settings)
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
      throw new Errors.ErrorMissingArgument({ spec })
    }
  }

  // dump({ args })
  return args
}
