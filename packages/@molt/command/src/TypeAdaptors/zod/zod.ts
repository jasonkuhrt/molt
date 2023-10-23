import type { Type } from '../../Type/Type.js'
import type { z } from 'zod'

export * from './helpers.js'

export const fromZod = (type: z.ZodType): Type => {
  return {
    _tag: `TypeString`,
  }
}
