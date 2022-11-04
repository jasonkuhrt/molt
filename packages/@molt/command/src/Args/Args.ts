import { Errors } from '../Errors/index.js'
import { groupByWith } from '../helpers.js'
import { groupBy } from '../lib/prelude.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import { Environment } from './Environment/index.js'
import { Line } from './Line/index.js'
import type { ArgumentReport } from './types.js'
export { Environment } from './Environment/index.js'
export { Line } from './Line/index.js'
export * from './types.js'

export const parse = (
  specs: ParameterSpec.Normalized[],
  argInputsLine: Line.RawInputs,
  argInputsEnvironment: Environment.RawInputs
): { args: Record<string, unknown>; errors: Errors.ErrorMissingArgument[] } => {
  const errors = []
  const argsFinal: Record<string, unknown> = {}
  const env = Environment.parse(argInputsEnvironment, specs)
  const lineParseResult = Line.parse(argInputsLine, specs)

  if (lineParseResult.errors.length > 0) errors.push(...lineParseResult.errors)

  // dump({ specs })
  // dump({ line })
  // dump({ env })

  const specVariants = groupBy(specs, `_tag`)

  for (const spec of specVariants.Basic ?? []) {
    /**
     * A note about types.
     *
     * The parse result of lines and environment arg inputs contains the associated spec
     * object. The results are generic and the spec variant is not known. In this loop we
     * deal with Basic spec variant only. Thus the args picked must be associated with
     * a Basic spec variant too. But the static type of arg.spec does not reflect this fact.
     * It has not been narrowed.
     *
     * No matter, we can just ignore the possibility to use arg.spec here anyways.
     */
    const arg = lineParseResult.line[spec.name.canonical] ?? env[spec.name.canonical]

    if (arg) {
      if (arg.errors.length > 0) {
        errors.push(...arg.errors)
        continue
      }
      if (arg.duplicates.length > 0) {
        errors.push(new Error(`Duplicate input for parameter ${spec.name.canonical}`))
        continue
      }

      if (arg.value._tag === `boolean`) {
        argsFinal[spec.name.canonical] = arg.value.negated ? !arg.value.value : arg.value.value
      } else {
        let value: unknown
        try {
          value = spec.type.parse(arg.value.value)
        } catch (e) {
          errors.push(new Error(`Invalid value for ${spec.name.canonical}`, { cause: e }))
          argsFinal[spec.name.canonical] = undefined
          continue
        }
        argsFinal[spec.name.canonical] = value
      }
      continue
    }

    if (spec.default) {
      try {
        argsFinal[spec.name.canonical] = spec.default.get()
      } catch (error) {
        errors.push(new Error(`Failed to get default value for ${spec.name.canonical}`, { cause: error }))
        argsFinal[spec.name.canonical] = undefined
      }
      continue
    }

    if (!spec.optional) {
      errors.push(new Errors.ErrorMissingArgument({ spec }))
    }

    argsFinal[spec.name.canonical] = undefined
  }

  /**
   * Handle exclusive parameter groups:
   *
   * 1. We must handle each group exactly once.
   * 2. If a group is optional and none of its parameters was given an arg then OK
   * 3. If a group is not optional and none of its parameters was given an arg then error
   * 4. If a group has more than one parameter with an arg then error
   * 5. If a group has exactly one parameter with an arg then OK
   */
  const exclusiveGroups = Object.values(groupByWith(specVariants.Exclusive ?? [], (spec) => spec.group.label))

  for (const specs of exclusiveGroups) {
    const group = specs[0]!.group // eslint-disable-line
    const argsToGroup = specs
      .map((_) => lineParseResult.line[_.name.canonical] ?? env[_.name.canonical])
      .filter((_): _ is ArgumentReport => _ !== undefined)

    if (argsToGroup.length === 0 && group.optional) {
      continue
    }

    if (argsToGroup.length === 0 && !group.optional) {
      errors.push(
        new Errors.ErrorMissingArgumentForMutuallyExclusiveParameters({
          group,
        })
      )
      continue
    }

    if (argsToGroup.length > 1) {
      errors.push(
        new Errors.ErrorArgsToMultipleMutuallyExclusiveParameters({
          offenses: argsToGroup.map((_) => ({ spec: _.spec as ParameterSpec.Normalized.Exclusive, arg: _ })),
        })
      )
      continue
    }

    if (argsToGroup.length === 1) {
      const arg = argsToGroup[0]! // eslint-disable-line
      argsFinal[group.label] = {
        _tag: arg.spec.name.canonical,
        value: arg.value.value,
      }
      continue
    }
  }

  // const missingArgs = specsResult.specs
  //         .filter((_) =>
  //           Alge.match(_)
  //             .Basic((_) => !_.optional)
  //             .Exclusive((_) => !_.group.optional)
  //         )
  //         .filter((_) => argsResult.args[_.name.canonical] === undefined)

  // dump({ args })
  return {
    args: argsFinal,
    errors,
  }
}
