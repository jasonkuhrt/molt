import { Command } from '../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// eslint-disable-next-line
const assertAssignable = <T>(_: T): [T] => 0 as any

// const def = Parameters.create({
//   filePath: z.string().describe(`Path to the file to convert.`),
//   to: z.enum([`json`, ` yaml`, `toml`]).describe(`Format to convert to.`),
//   from: z.enum([`json`, `yaml`, `toml`]).optional().describe(`Format to convert from.`),
//   verbose: z.boolean().optional().default(false).describe(`Log detailed progress as conversion executes.`),
// }).parse()

describe(`.create`, () => {
  it(`creates a parameters definition`, () => {
    const def = Command.create({ x: z.string() })
    expect(def.parseOrThrow).toBeTypeOf(`function`)
  })
})

describe(`settings`, () => {
  it(`permits setting a description`, () => {
    Command.create({ x: z.string() }).settings({ description: `foobar` }).parseOrThrow([`-x`, `foobar`])
  })
})

describe(`#.schema`, () => {
  it(`is the schema used to define the parameters`, () => {
    const def = Command.create({ x: z.string() })
    assertAssignable<z.ZodRawShape>(def.schema)
    assertAssignable<{ x: z.ZodString }>(def.schema)
    expect(def.schema).toBeDefined()
  })
})
