import type { Settings } from '../../../index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import type { ArgumentValue } from '../../types.js'
import { processEnvironment } from '../helpers/environment.js'
import { processName } from '../helpers/name.js'
import { analyzeZodTypeScalar } from '../helpers/type.js'

export const processBasic = (
  expression: string,
  input: Input.Basic,
  settings: Settings.Output
): Output.Basic => {
  const name = processName(expression)
  const environment = processEnvironment(settings, name)
  const typeAnalysis = analyzeZodType(input)
  const parameter = {
    _tag: `Basic`,
    description: typeAnalysis.description,
    type: typeAnalysis.type,
    optionality: typeAnalysis.optionality,
    prompt: input.prompt,
    environment,
    name,
  } satisfies Output.Basic

  return parameter
}

export const analyzeZodType = (input: Input.Basic) => {
  const isOptional = input.type._def.typeName === `ZodOptional`
  const hasDefault = input.type._def.typeName === `ZodDefault`
  // @ts-expect-error todo
  // eslint-disable-next-line
  const defaultGetter = hasDefault ? (input.type._def.defaultValue as DefaultGetter) : null
  const { description, type } = analyzeZodTypeScalar(input.type)
  const optionality = (
    defaultGetter
      ? { _tag: `default`, getValue: () => defaultGetter() }
      : isOptional
      ? { _tag: `optional` }
      : { _tag: `required` }
  ) satisfies Output.Basic['optionality']

  return {
    optionality,
    description,
    type,
  }
}

type DefaultGetter = () => ArgumentValue
