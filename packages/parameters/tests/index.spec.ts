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
    expect(def.parseOrThrow).toBeTypeOf(`function`)
  })
})

describe(`settings`, () => {
  it(`permits setting a description`, () => {
    Parameters.create({ x: z.string() }).settings({ description: `foobar` }).parseOrThrow([`-x`, `foobar`])
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

  describe(`.parseOrThrow`, () => {
    it(`parses the process input according to the parameters schema`, () => {
      const args = Parameters.create({ '-x': z.string() }).parseOrThrow([`-x`, `foo`])
      assert<IsExact<{ x: string }, typeof args>>(true)
      expect(args).toEqual({ x: `foo` })
    })
    it(`property name uses long name when available`, () => {
      const args = Parameters.create({ '--xee -x': z.string() }).parseOrThrow([`-x`, `foo`])
      assert<IsExact<{ xee: string }, typeof args>>(true)
      expect(`xee` in args).toBe(true)
    })

    describe(`flag types`, () => {
      describe(`string`, () => {
        it(`throws error when argument missing (last position)`, () => {
          expect(() =>
            Parameters.create({ '--name': z.string() }).parseOrThrow([`--name`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"name\\"."`)
        })
        it(`throws error when argument missing (non-last position)`, () => {
          expect(() =>
            Parameters.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([
              `--name`,
              ` --age`,
              `1`,
            ])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"name\\"."`)
        })
        it(`is validated`, () => {
          expect(() =>
            Parameters.create({ '--name': z.string().regex(/[a-z]+/) }).parseOrThrow([`--name`, `BAD`])
          ).toThrowErrorMatchingInlineSnapshot(`
            "Invalid argument for flag: \\"name\\". The error was:
            Invalid"
          `)
        })
      })
      describe(`number`, () => {
        it(`input is cast as a number`, () => {
          const args = Parameters.create({ '--age': z.number() }).parseOrThrow([`--age`, `1`])
          assert<IsExact<{ age: number }, typeof args>>(true)
          expect(args).toEqual({ age: 1 })
        })
        it(`throws error when argument missing (last position)`, () => {
          expect(() =>
            Parameters.create({ '--age': z.number() }).parseOrThrow([`--age`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"age\\"."`)
        })
        it(`throws error when argument missing (non-last position)`, () => {
          expect(() =>
            Parameters.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([
              ` --age`,
              `--name`,
              `joe`,
            ])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"age\\"."`)
        })
        it(`is validated`, () => {
          expect(() => Parameters.create({ '--age': z.number().int() }).parseOrThrow([`--age`, `1.1`]))
            .toThrowErrorMatchingInlineSnapshot(`
              "Invalid argument for flag: \\"age\\". The error was:
              Expected integer, received float"
            `)
        })
      })
      describe(`enum`, () => {
        it(`throws error when argument missing (last position)`, () => {
          expect(() =>
            Parameters.create({ '--mode': z.enum([`a`, `b`]) }).parseOrThrow([`--mode`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"mode\\"."`)
        })
        it(`throws error when argument missing (non-last position)`, () => {
          expect(() =>
            // prettier-ignore
            Parameters.create({ '--name': z.string(), '--mode': z.enum([`a`,`b`]) }).parseOrThrow([` --mode`, `--name`, `joe`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"mode\\"."`)
        })
        it(`is validated`, () => {
          // const args = Parameters.create({ '--mode': z.enum([`a`, `b`, `c`]) }).parseOrThrow([`--mode`, `bad`])
          // assert<IsExact<{ mode: 'a'|'b'|'c' }, typeof args>>(true)
          // expect(args).toEqual({ mode: true })
          expect(() =>
            Parameters.create({ '--mode': z.enum([`a`, `b`, `c`]) }).parseOrThrow([`--mode`, `bad`])
          ).toThrowErrorMatchingInlineSnapshot(`
            "Invalid argument for flag: \\"mode\\". The error was:
            Invalid enum value. Expected 'a' | 'b' | 'c', received 'bad'"
          `)
        })
      })
      describe(`boolean`, () => {
        it(`when given, implies true`, () => {
          const args = Parameters.create({ '--verbose': z.boolean() }).parseOrThrow([`--verbose`])
          assert<IsExact<{ verbose: boolean }, typeof args>>(true)
          expect(args).toEqual({ verbose: true })
        })
        it(`when default specified input can be omitted, default value used`, () => {
          const args = Parameters.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
          assert<IsExact<{ verbose: boolean }, typeof args>>(true)
          expect(args).toEqual({ verbose: false })
        })
        it(`when optional specified input can be omitted, undefined is possible`, () => {
          const args = Parameters.create({ '--verbose': z.boolean().optional() }).parseOrThrow([])
          assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
          expect(args).toEqual({ verbose: undefined })
        })
        it(`A negated variant of the flag may be accepted`, () => {
          const args = Parameters.create({ '--verbose': z.boolean() }).parseOrThrow([`--no-verbose`])
          assert<IsExact<{ verbose: boolean }, typeof args>>(true)
          expect(args).toEqual({ verbose: false })
        })
      })
    })
  })
})
