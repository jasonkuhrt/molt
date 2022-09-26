import type { SchemaBase } from './types.js'
import camelCase from 'lodash.camelcase'
import type { z } from 'zod'
import { stripeDashPrefix } from './helpers.js'

export type FlagSpec =
  | {
      _tag: 'Long'
      canonical: string
      schema: z.ZodType
      schemaBase: SchemaBase
      long: string
      short: undefined
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }
  | {
      _tag: 'Short'
      schema: z.ZodType
      schemaBase: SchemaBase
      canonical: string
      long: undefined
      short: string
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }
  | {
      _tag: 'LongShort'
      schema: z.ZodType
      schemaBase: SchemaBase
      canonical: string
      long: string
      short: string
      aliases: {
        short: [...string[]]
        long: [...string[]]
      }
    }

export const parseFlagSpecs = (schema: z.ZodRawShape): FlagSpec[] =>
  Object.entries(schema).map(([expression, schema]) => {
    const names = expression
      .trim()
      .split(` `)
      .map((exp) => exp.trim())
      .map(stripeDashPrefix)

    // eslint-disable-next-line
    const spec: FlagSpec = {
      long: undefined,
      short: undefined,
      schema,
      aliases: {
        long: [],
        short: [],
      },
      // eslint-disable-next-line
    } as any

    for (const name of names) {
      if (name.length === 1)
        if (spec.short) spec.aliases.short.push(name)
        else spec.short = name
      else if (name.length > 1)
        if (spec.long) spec.aliases.long.push(camelCase(name))
        else spec.long = camelCase(name)
      else throw new Error(`Invalid flag name: ${name}`)
    }

    if (spec.short && spec.long) {
      spec._tag = `LongShort`
      spec.canonical = camelCase(spec.long)
    } else if (spec.short) {
      spec._tag = `Short`
      spec.canonical = spec.short
    } else if (spec.long) {
      spec._tag = `Long`
      spec.canonical = camelCase(spec.long)
    } else throw new Error(`Invalid flag name: ${names.join(` `)}`)

    spec.schemaBase = getSchemaBase(spec.schema)

    return spec
  })

const getSchemaBase = (schema: z.ZodSchema): SchemaBase => {
  // @ts-expect-error ignore-me
  if (schema._def.typeName === `ZodDefault`) {
    // @ts-expect-error ignore-me
    // eslint-disable-next-line
    return getSchemaBase(schema._def.innerType)
  }

  // @ts-expect-error ignore-me
  if (schema._def.typeName === `ZodOptional`) {
    // @ts-expect-error ignore-me
    // eslint-disable-next-line
    return getSchemaBase(schema._def.innerType)
  }

  // @ts-expect-error ignore-me
  // eslint-disable-next-line
  return schema._def.typeName
}
