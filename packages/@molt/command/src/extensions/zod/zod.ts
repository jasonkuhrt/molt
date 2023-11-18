import { createExtension } from '../../extension.js'
import type { HKT } from '../../helpers.js'
import { fromZod } from './typeAdaptor/runtime.js'
import type { FromZod } from './typeAdaptor/types.js'
import type { ZodType } from './types.js'
import type { z } from 'zod'

export interface ZodTypeMapper extends HKT.Fn<z.ZodTypeAny> {
  return: FromZod<this['params']>
}

export const Zod = createExtension<ZodType, ZodTypeMapper>({
  name: `Zod`,
  type: (zodType) => {
    return fromZod(zodType) as any
  },
})
