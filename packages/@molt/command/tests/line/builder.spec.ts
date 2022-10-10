import { Command } from '../../src/index.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// eslint-disable-next-line
const assertAssignable = <T>(_: T): [T] => 0 as any

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
