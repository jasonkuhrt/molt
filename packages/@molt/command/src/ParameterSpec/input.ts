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
