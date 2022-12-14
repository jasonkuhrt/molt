import type { Settings } from '../../../index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import type { ArgumentValue } from '../../types.js'
import { processEnvironment } from '../helpers/environment.js'
import { processName } from '../helpers/name.js'
import { analyzeTypeScalar } from '../helpers/type.js'

export const processBasic = (
  expression: string,
  input: Input.Basic,
  settings: Settings.Output
): Output.Basic => {
  const name = processName(expression)
  const environment = processEnvironment(settings, name)
  const typeAnalysis = analyzeType(input)
  const parameter = {
    _tag: `Basic`,
    zodType: input.type,
    description: typeAnalysis.description,
    typePrimitiveKind: typeAnalysis.primitiveKind,
    optionality: typeAnalysis.optionality,
    environment,
    name,
  } satisfies Output.Basic

  return parameter
}

export const analyzeType = (input: Input.Basic) => {
  const isOptional = input.type._def.typeName === `ZodOptional`
  const hasDefault = input.type._def.typeName === `ZodDefault`
  // @ts-expect-error todo
  // eslint-disable-next-line
  const defaultGetter = hasDefault ? (input.type._def.defaultValue as DefaultGetter) : null
  const { description, primitiveKind } = analyzeTypeScalar(input.type)
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
    primitiveKind,
  }
}

type DefaultGetter = () => ArgumentValue
