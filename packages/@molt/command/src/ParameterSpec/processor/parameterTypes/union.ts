import type { Settings } from '../../../index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import type { ArgumentValue } from '../../types.js'
import { getUnionScalar } from '../../types.js'
import { processEnvironment } from '../helpers/environment.js'
import { processName } from '../helpers/name.js'
import { analyzeTypeScalar } from '../helpers/type.js'

export const processUnion = (
  nameExpression: string,
  input: Input.Union,
  settings: Settings.Output
): Output.Union => {
  const name = processName(nameExpression)
  const environment = processEnvironment(settings, name)
  const typeAnalysis = analyzeType(input)
  const parameter: Output.Union = {
    _tag: `Union`,
    name,
    environment,
    description: typeAnalysis.description,
    optionality: typeAnalysis.optionality,
    types: typeAnalysis.types,
  }
  return parameter
}

const analyzeType = (input: Input.Union) => {
  const isOptional = input.type._def.typeName === `ZodOptional`
  const hasDefault = input.type._def.typeName === `ZodDefault`
  // @ts-expect-error todo
  // eslint-disable-next-line
  const defaultGetter = hasDefault ? (type._def.defaultValue() as DefaultGetter) : null
  const description = input.type.description ?? null
  const union = getUnionScalar(input.type)
  const types = union._def.options.map((_) => {
    const typeAnalysis = analyzeTypeScalar(_)
    return {
      type: _,
      description: typeAnalysis.description,
      typePrimitiveKind: typeAnalysis.primitiveKind,
    }
  })
  const optionality = (
    defaultGetter
      ? { _tag: `default`, getValue: () => defaultGetter() }
      : isOptional
      ? { _tag: `optional` }
      : { _tag: `required` }
  ) satisfies Output.Union['optionality']

  return {
    optionality,
    description,
    types,
  }
}

type DefaultGetter = () => ArgumentValue
