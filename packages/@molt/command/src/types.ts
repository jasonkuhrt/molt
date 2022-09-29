import type { z } from 'zod'

export type SchemaBase = 'ZodBoolean' | 'ZodNumber' | 'ZodString'

export type SomeSchema = z.ZodRawShape
