import type { Settings } from '../../../index.js'
import { ZodHelpers } from '../../../lib/zodHelpers/index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import type { ArgumentValueScalar } from '../../types.js'
import { processEnvironment } from '../helpers/environment.js'
import { processName } from '../helpers/name.js'
import { analyzeZodType } from '../helpers/zod.js'
import { union, z } from 'zod'

export const processBasic = (
  expression: string,
  input: Input.Basic,
  settings: Settings.Output,
): Output.Basic => {
  const name = processName(expression)
  const environment = processEnvironment(settings, name)
  const typeAnalysis = analyzeType(input)
  const parameter = {
    _tag: `Basic`,
    description: typeAnalysis.description,
    type: typeAnalysis.type,
    optionality: typeAnalysis.optionality,
    prompt: {
      enabled:
        input.prompt === true
          ? true
          : input.prompt === false
          ? false
          : input.prompt === null
          ? null
          : input.prompt.enabled ?? null,
      when:
        input.prompt === null ? null : typeof input.prompt === `object` ? input.prompt.when ?? null : null,
    },
    environment,
    name,
  } satisfies Output.Basic

  return parameter
}

export const analyzeType = (input: Input.Basic) => {
  const isOptional = input.type._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional
  const hasDefault = input.type._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault
  // @ts-expect-error todo
  // eslint-disable-next-line
  const defaultGetter = hasDefault ? (input.type._def.defaultValue as DefaultGetter) : null
  const optionality = (
    defaultGetter
      ? { _tag: `default`, getValue: () => defaultGetter() }
      : isOptional
      ? { _tag: `optional` }
      : { _tag: `required` }
  ) satisfies Output.Basic['optionality']

  const type_ = ZodHelpers.stripOptionalAndDefault(input.type)

  if (type_._def.typeName === z.ZodFirstPartyTypeKind.ZodUnion) {
    const types = type_._def.options.map((_) => {
      const typeAnalysis = analyzeZodType(_)
      return {
        zodType: _,
        description: typeAnalysis.description,
        type: typeAnalysis.type,
      }
    })
    return
  }

  const { type, description } = analyzeZodType(type_._def)

  return {
    optionality,
    description,
    type,
  }
}

type DefaultGetter = () => ArgumentValueScalar
