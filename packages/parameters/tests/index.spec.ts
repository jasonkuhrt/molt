import { Parameters } from '../src'
import { assert, IsExact } from 'conditional-type-checks'
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
    const def = Parameters.create({ x: z.string() })
    expect(def.parse).toBeTypeOf(`function`)
  })
})

describe(`#`, () => {
  describe(`.schema`, () => {
    it(`is the schema used to define the parameters`, () => {
      const def = Parameters.create({ x: z.string() })
      assertAssignable<z.ZodRawShape>(def.schema)
      assertAssignable<{ x: z.ZodString }>(def.schema)
      expect(def.schema).toBeDefined()
    })
  })
  describe(`.parse`, () => {
    it(`parses the process input according to the parameters schema`, () => {
      const def = Parameters.create({ '-x': z.string() })
      const args = def.parse([`-x`, `foo`])
      assert<IsExact<{ x: string }, typeof args>>(true)
      expect(args).toEqual({ x: `foo` })
    })
    it(`property name uses long name when avaialble`, () => {
      const args = Parameters.create({ '--xee -x': z.string() }).parse([`-x`, `foo`])
      assert<IsExact<{ xee: string }, typeof args>>(true)
      expect(args).toEqual({ xee: `foo` })
    })
  })
})
