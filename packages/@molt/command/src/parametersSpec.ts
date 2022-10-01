import { stripeDashPrefix } from './helpers.js'
import { ZodHelpers } from './lib/zodHelpers/index.js'
import camelCase from 'lodash.camelcase'
import type { z } from 'zod'

export type ParameterSpec =
  | {
      _tag: 'Long'
      schema: z.ZodType
      schemaPrimitive: ZodHelpers.ZodPrimitive
      name: {
        canonical: string
        long: string
        short: undefined
        aliases: {
          short: [...string[]]
          long: [...string[]]
        }
      }
    }
  | {
      _tag: 'Short'
      schema: z.ZodType
      schemaPrimitive: ZodHelpers.ZodPrimitive
      name: {
        canonical: string
        long: undefined
        short: string
        aliases: {
          short: [...string[]]
          long: [...string[]]
        }
      }
    }
  | {
      _tag: 'LongShort'
      schema: z.ZodType
      schemaPrimitive: ZodHelpers.ZodPrimitive
      name: {
        canonical: string
        long: string
        short: string
        aliases: {
          short: [...string[]]
          long: [...string[]]
        }
      }
    }

export const parseParametersSpec = (schema: z.ZodRawShape): ParameterSpec[] =>
  Object.entries(schema).map(([expression, schema]) => {
    const names = expression
      .trim()
      .split(` `)
      .map((exp) => exp.trim())
      .map(stripeDashPrefix)

    // eslint-disable-next-line
    const spec: ParameterSpec = {
      schema,
      schemaPrimitive: ZodHelpers.getZodPrimitive(schema),
      name: {
        long: undefined,
        short: undefined,
        aliases: {
          long: [],
          short: [],
        },
      },
      // eslint-disable-next-line
    } as any

    for (const name of names) {
      if (name.length === 1)
        if (spec.name.short) spec.name.aliases.short.push(name)
        else spec.name.short = name
      else if (name.length > 1)
        if (spec.name.long) spec.name.aliases.long.push(camelCase(name))
        else spec.name.long = camelCase(name)
      else throw new Error(`Invalid flag name: ${name}`)
    }

    if (spec.name.short && spec.name.long) {
      spec._tag = `LongShort`
      spec.name.canonical = camelCase(spec.name.long)
    } else if (spec.name.short) {
      spec._tag = `Short`
      spec.name.canonical = spec.name.short
    } else if (spec.name.long) {
      spec._tag = `Long`
      spec.name.canonical = camelCase(spec.name.long)
    } else throw new Error(`Invalid flag name: ${names.join(` `)}`)

    return spec
  })
