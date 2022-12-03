// TODO better solution for this.
/*
Error: packages/@molt/command build: src/ParameterSpec/input.ts(6,14): error TS2742: The inferred type of 'Input' cannot be named without a reference to '../../node_modules/alge/dist/esm/core/types.js'. This is likely not portable. A type annotation is necessary.
25
Error: packages/@molt/command build: src/ParameterSpec/input.ts(6,14): error TS2742: The inferred type of 'Input' cannot be named without a reference to '../../node_modules/alge/dist/esm/data/types/Controller.js'. This is likely not portable. A type annotation is necessary.
26
Error: packages/@molt/command build: src/ParameterSpec/input.ts(6,14): error TS2742: The inferred type of 'Input' cannot be named without a reference to '../../node_modules/alge/dist/esm/record/types/StoredRecord.js'. This is likely not portable. A type annotation is necessary.
27
Error: packages/@molt/command build: src/ParameterSpec/input.ts(6,14): error TS2742: The inferred type of 'Input' cannot be named without a reference to '../../node_modules/zod/lib/helpers/errorUtil.js'. This is likely not portable. A type annotation is necessary.
28
Error: packages/@molt/command build: src/ParameterSpec/input.ts(6,14): error TS2742: The inferred type of 'Input' cannot be named without a reference to '../../node_modules/zod/lib/helpers/util.js'. This is likely not portable. A type annotation is necessary.
29
Error: packages/@molt/command build: src/ParameterSpec/normalized.ts(62,14): error TS2742: The inferred type of 'Normalized' cannot be named without a reference to '../../node_modules/alge/dist/esm/core/types.js'. This is likely not portable. A type annotation is necessary.
30
Error: packages/@molt/command build: src/ParameterSpec/normalized.ts(62,14): error TS2742: The inferred type of 'Normalized' cannot be named without a reference to '../../node_modules/alge/dist/esm/data/types/Controller.js'. This is likely not portable. A type annotation is necessary.
31
Error: packages/@molt/command build: src/ParameterSpec/normalized.ts(62,14): error TS2742: The inferred type of 'Normalized' cannot be named without a reference to '../../node_modules/alge/dist/esm/record/types/StoredRecord.js'. This is likely not portable. A type annotation is necessary.
32
Error: packages/@molt/command build: src/ParameterSpec/normalized.ts(62,14): error TS2742: The inferred type of 'Normalized' cannot be named without a reference to '../../node_modules/zod/lib/helpers/errorUtil.js'. This is likely not portable. A type annotation is necessary.
33
Error: packages/@molt/command build: src/ParameterSpec/normalized.ts(62,14): error TS2742: The inferred type of 'Normalized' cannot be named without a reference to '../../node_modules/zod/lib/helpers/util.js'. This is likely not portable. A type annotation is necessary.
*/
import * as _1 from '../../node_modules/alge/dist/esm/core/types.js'
import * as _2 from '../../node_modules/alge/dist/esm/data/types/Controller.js'
import * as _3 from '../../node_modules/alge/dist/esm/record/types/StoredRecord.js'
import * as _4 from '../../node_modules/zod/lib/helpers/errorUtil.js'
import * as _5 from '../../node_modules/zod/lib/helpers/util.js'
import { zodPassthrough } from '../helpers.js'
import type { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { SomeBasicZodType } from './ParametersSpec.js'
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
  default: null | { tag: string; value: unknown }
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

// @ts-expect-error - https://github.com/colinhacks/zod/issues/1628
const Exclusive: z.ZodType<Exclusive> = z.lazy(() =>
  z.object({
    label: z.string(),
    optional: z.boolean(),
    default: z.null().or(z.object({ tag: z.string(), value: z.unknown() })),
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
