import { createExtension } from '../../extension.js'
import type { HKT } from '../../helpers.js'
import { fromZod } from './typeAdaptor/runtime.js'
import type { FromZod } from './typeAdaptor/types.js'
import type { ZodType } from './types.js'

export interface ZodTypeMapper extends HKT.Fn<unknown> {
  // @ts-expect-error - todo with Pierre
  return: FromZod<this['params']>
}

// @ts-expect-error - todo with Pierre
export const Zod = createExtension<ZodType, ZodTypeMapper>({
  name: `Zod`,
  type: (zodType) => {
    return fromZod(zodType) as any
  },
})
