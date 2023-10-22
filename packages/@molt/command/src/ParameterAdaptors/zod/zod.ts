import { TypeAdaptors } from '../../TypeAdaptors/index.js'
import { z } from 'zod'

export const inferPropsFromZodType = (
  zodType: TypeAdaptors.Zod.SomeBasicType | TypeAdaptors.Zod.SomeUnionType,
) => {
  const isOptional = zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional
  const hasDefault = zodType._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault
  const defaultGetter = hasDefault ? (zodType._def.defaultValue as DefaultGetter) : null
  const optionality: Pam.Optionality = defaultGetter
    ? { _tag: `default`, getValue: () => defaultGetter() }
    : isOptional
    ? { _tag: `optional` }
    : { _tag: `required` }

  const { type, description } = TypeAdaptors.Zod.analyzeZodType(zodType)

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
