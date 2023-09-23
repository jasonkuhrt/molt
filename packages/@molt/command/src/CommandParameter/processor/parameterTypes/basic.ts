import type { Settings } from '../../../index.js'
import type { Pam } from '../../../lib/Pam/index.js'
import type { Input } from '../../input.js'
import type { Output } from '../../output.js'
import type { SomeBasicType, SomeUnionType } from '../../types.js'
import { processEnvironment } from '../helpers/environment.js'
import { processName } from '../helpers/name.js'
import { analyzeZodType } from '../helpers/zod.js'
import { z } from 'zod'

export const processBasic = (
  expression: string,
  input: Input.Basic,
  settings: Settings.Output,
): Output.Basic => {
  const name = processName(expression)
  const environment = processEnvironment(settings, name)
  const inferredProperties = inferPropsFromZodType(input.type)
  const parameter = {
    _tag: `Basic`,
    environment,
    name,
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
    ...inferredProperties,
  } satisfies Output.Basic

  return parameter
}

export const inferPropsFromZodType = (zodType: SomeBasicType | SomeUnionType) => {
  const isOptional = zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional
  const hasDefault = zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault
  const defaultGetter = hasDefault ? (zodType._def.defaultValue as DefaultGetter) : null
  const optionality: Pam.Optionality = defaultGetter
    ? { _tag: `default`, getValue: () => defaultGetter() }
    : isOptional
    ? { _tag: `optional` }
    : { _tag: `required` }

  const { type, description } = analyzeZodType(zodType)

  return {
    optionality,
    description,
    // Cannot use @ts-expect-error because someone the build then
    // does _not_ detect an error here, in which case the expect error
    // itself triggers the error... chicken and egg problem.
    //
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore todo
    type: type,
  }
}

type DefaultGetter = () => Pam.Value
