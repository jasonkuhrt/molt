import { Alge } from 'alge'
import type { ParameterBasic, ParameterBasicInput } from '../../Parameter/basic.js'
import { parameterBasicCreate } from '../../Parameter/basic.js'
import type { ParameterExclusive, ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import { parameterExclusiveCreate } from '../../Parameter/exclusive.js'
import type { Parameter } from '../../Parameter/types.js'
import type { Settings } from '../../Settings/index.js'
import { Type } from '../../Type/index.js'

/**
 * Process the spec input into a normalized spec.
 */
export const createParameters = (
  inputs: Record<string, ParameterBasicInput | ParameterExclusiveInput>,
  settings: Settings.Output,
): Parameter[] => {
  const inputsWithHelp: Record<string, ParameterBasicInput | ParameterExclusiveInput> = settings.help
    ? {
      ...inputs,
      '-h --help': helpParameter,
    }
    : inputs
  const outputs = Object.values(inputsWithHelp).flatMap((input): (ParameterBasic | ParameterExclusive)[] =>
    Alge.match(input)
      .Basic((input) => [parameterBasicCreate(input, settings)])
      .Exclusive((input) => parameterExclusiveCreate(input, settings))
      .done()
  )

  // dump({ outputs })
  return outputs
}

const helpParameter: ParameterBasicInput = {
  _tag: `Basic`,
  type: Type.boolean({ optionality: { _tag: `default`, getValue: () => false } }),
  nameExpression: `-h --help`,
  prompt: false as any, // eslint-disable-line
}
