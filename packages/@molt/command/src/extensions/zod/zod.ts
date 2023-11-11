import type { CommandParameter } from '../../CommandParameter/index.js'
import { createExtension } from '../../extension.js'
import type { HKT } from '../../helpers.js'
import { TypeAdaptor } from './TypeAdaptor/index.js'
import type { z } from 'zod'

export type ZodType = CommandParameter.SomeBasicType | CommandParameter.SomeUnionType

interface ZodTypeMapper extends HKT.Fn<z.ZodTypeAny> {
  return: TypeAdaptor.Zod.FromZod<this['params']>
}

export const Zod = createExtension<ZodType, ZodTypeMapper>({
  name: `Zod`,
  type: (zodType: z.ZodFirstPartySchemaTypes) => TypeAdaptor.Zod.fromZod(zodType) as any,
})
