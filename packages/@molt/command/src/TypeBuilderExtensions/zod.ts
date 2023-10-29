import { TypeAdaptors } from '../TypeAdaptors/index.js'
import { createExtension } from '../TypeBuilder/extension.js'

export const ZodTypes = createExtension({
  namespace: `$fromZod`,
  properties: TypeAdaptors.Zod.fromZod,
})
