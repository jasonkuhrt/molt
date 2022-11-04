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
import type { SomeBasicZodType, SomeExclusiveZodType } from './ParametersSpec.js'
import { Alge } from 'alge'
import { z } from 'zod'

export const Input = Alge.data(`ParameterSpecInput`, {
  Basic: {
    type: zodPassthrough<SomeBasicZodType>(),
  },
  Exclusive: {
    optional: z.boolean(),
    values: z.array(
      z.object({
        nameExpression: z.string(),
        type: zodPassthrough<SomeExclusiveZodType>(),
      })
    ),
  },
})

type $Input = Alge.Infer<typeof Input>

export type Input = $Input['*']

export namespace Input {
  export type Basic = $Input['Basic']
  export type Exclusive = $Input['Exclusive']
}
