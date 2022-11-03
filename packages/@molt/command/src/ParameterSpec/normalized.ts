import { zodPassthrough } from '../helpers.js'
import type { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { SomeBasicZodType, SomeExclusiveZodType } from './ParametersSpec.js'
import { Alge } from 'alge'
import { z } from 'zod'

const commonFields = {
  type: zodPassthrough<SomeBasicZodType>(),
  typePrimitiveKind: zodPassthrough<ZodHelpers.Primitive>(),
  description: z.string().nullable(),
  name: zodPassthrough<
    {
      canonical: string
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    } & ({ long: string; short: null } | { long: null; short: string } | { long: string; short: string })
  >(),
  environment: zodPassthrough<null | {
    enabled: boolean
    namespaces: Array<string>
  }>(),
}

export interface Exclusive {
  label: string
  optional: boolean
  values: Record<string, ParameterExclusive>
}

interface Parameter {
  type: SomeBasicZodType
  typePrimitiveKind: ZodHelpers.Primitive
  description: string | null
  name: {
    canonical: string
    aliases: {
      short: [...string[]]
      long: [...string[]]
    }
  } & ({ long: string; short: null } | { long: null; short: string } | { long: string; short: string })
  environment: null | {
    enabled: boolean
    namespaces: Array<string>
  }
}

interface ParameterExclusive extends Parameter {
  _tag: 'Exclusive'
  group: Exclusive
}

const Exclusive: z.ZodType<Exclusive> = z.lazy(() =>
  z.object({
    label: z.string(),
    optional: z.boolean(),
    values: z.record(zodPassthrough<Normalized.Exclusive>()),
  })
)

export const Normalized = Alge.data(`Normalized`, {
  Basic: {
    ...commonFields,
    default: zodPassthrough<null | { get: () => unknown }>(),
    optional: z.boolean(),
  },
  Exclusive: {
    ...commonFields,
    group: Exclusive,
  },
})

type $Normalized = Alge.Infer<typeof Normalized>

export type Normalized = $Normalized['*']

export namespace Normalized {
  export type Basic = $Normalized['Basic']
  export type Exclusive = $Normalized['Exclusive']
}
