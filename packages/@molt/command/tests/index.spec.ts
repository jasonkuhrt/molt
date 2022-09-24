import { Command } from '../src/index.js'
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

describe(`#`, () => {
  describe(`.schema`, () => {
    it(`is the schema used to define the parameters`, () => {
      const def = Command.create({ x: z.string() })
      assertAssignable<z.ZodRawShape>(def.schema)
      assertAssignable<{ x: z.ZodString }>(def.schema)
      expect(def.schema).toBeDefined()
    })
  })

  describe(`canonical flag`, () => {
    it(`flag can accept long & short and be given long`, () => {
      const args = Command.create({ '--ver -v': z.string() }).parseOrThrow([`--ver`, `foo`])
      expect(args).toEqual({ ver: `foo` })
    })
    it(`flag can accept long & short and be given short`, () => {
      const args = Command.create({ '--ver -v': z.string() }).parseOrThrow([`-v`, `foo`])
      expect(args).toEqual({ ver: `foo` })
    })
    it(`flag can accept short and be given short`, () => {
      const args = Command.create({ '-v': z.string() }).parseOrThrow([`-v`, `foo`])
      expect(args).toEqual({ v: `foo` })
    })
    it(`flag can accept long and be given long`, () => {
      const args = Command.create({ '--ver': z.string() }).parseOrThrow([`--ver`, `foo`])
      expect(args).toEqual({ ver: `foo` })
    })
    describe(`case`, () => {
      it(`kebab case param spec can be passed camel case parameter`, () => {
        const args = Command.create({ '--foo-bar': z.string() }).parseOrThrow([`--fooBar`, `foo`])
        assert<IsExact<{ fooBar: string }, typeof args>>(true)
        expect(args).toEqual({ fooBar: `foo` })
      })
      it(`kebab case param spec can be passed kebab case parameter`, () => {
        const args = Command.create({ '--foo-bar': z.string() }).parseOrThrow([`--foo-bar`, `foo`])
        assert<IsExact<{ fooBar: string }, typeof args>>(true)
        expect(args).toEqual({ fooBar: `foo` })
      })
      it(`camel case param spec can be passed kebab case parameter`, () => {
        const args = Command.create({ '--fooBar': z.string() }).parseOrThrow([`--foo-bar`, `foo`])
        assert<IsExact<{ fooBar: string }, typeof args>>(true)
        expect(args).toEqual({ fooBar: `foo` })
      })
      it(`camel case param spec can be passed camel case parameter`, () => {
        const args = Command.create({ '--fooBar': z.string() }).parseOrThrow([`--fooBar`, `foo`])
        assert<IsExact<{ fooBar: string }, typeof args>>(true)
        expect(args).toEqual({ fooBar: `foo` })
      })
    })
  })

  describe(`.parseOrThrow`, () => {
    it(`parses the process input according to the parameters schema`, () => {
      const args = Command.create({ '-x': z.string() }).parseOrThrow([`-x`, `foo`])
      assert<IsExact<{ x: string }, typeof args>>(true)
      expect(args).toEqual({ x: `foo` })
    })
    it(`property name uses long name when available`, () => {
      const args = Command.create({ '--xee -x': z.string() }).parseOrThrow([`-x`, `foo`])
      assert<IsExact<{ xee: string }, typeof args>>(true)
      expect(`xee` in args).toBe(true)
    })

    describe(`flag types`, () => {
      describe(`string`, () => {
        it(`throws error when argument missing (last position)`, () => {
          expect(() =>
            Command.create({ '--name': z.string() }).parseOrThrow([`--name`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"name\\"."`)
        })
        it(`throws error when argument missing (non-last position)`, () => {
          expect(() =>
            Command.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([
              `--name`,
              ` --age`,
              `1`,
            ])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"name\\"."`)
        })
        it(`is validated`, () => {
          expect(() =>
            Command.create({ '--name': z.string().regex(/[a-z]+/) }).parseOrThrow([`--name`, `BAD`])
          ).toThrowErrorMatchingInlineSnapshot(`
            "Invalid argument for parameter: \\"name\\". The error was:
            Invalid"
          `)
        })
      })
      describe(`number`, () => {
        it(`input is cast as a number`, () => {
          const args = Command.create({ '--age': z.number() }).parseOrThrow([`--age`, `1`])
          assert<IsExact<{ age: number }, typeof args>>(true)
          expect(args).toEqual({ age: 1 })
        })
        it(`throws error when argument missing (last position)`, () => {
          expect(() =>
            Command.create({ '--age': z.number() }).parseOrThrow([`--age`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"age\\"."`)
        })
        it(`throws error when argument missing (non-last position)`, () => {
          expect(() =>
            Command.create({ '--name': z.string(), '--age': z.number() }).parseOrThrow([
              ` --age`,
              `--name`,
              `joe`,
            ])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"age\\"."`)
        })
        it(`is validated`, () => {
          expect(() => Command.create({ '--age': z.number().int() }).parseOrThrow([`--age`, `1.1`]))
            .toThrowErrorMatchingInlineSnapshot(`
              "Invalid argument for parameter: \\"age\\". The error was:
              Expected integer, received float"
            `)
        })
      })
      describe(`enum`, () => {
        it(`throws error when argument missing (last position)`, () => {
          expect(() =>
            Command.create({ '--mode': z.enum([`a`, `b`]) }).parseOrThrow([`--mode`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"mode\\"."`)
        })
        it(`throws error when argument missing (non-last position)`, () => {
          expect(() =>
            // prettier-ignore
            Command.create({ '--name': z.string(), '--mode': z.enum([`a`,`b`]) }).parseOrThrow([` --mode`, `--name`, `joe`])
          ).toThrowErrorMatchingInlineSnapshot(`"Missing argument for flag \\"mode\\"."`)
        })
        it(`is validated`, () => {
          // const args = Parameters.create({ '--mode': z.enum([`a`, `b`, `c`]) }).parseOrThrow([`--mode`, `bad`])
          // assert<IsExact<{ mode: 'a'|'b'|'c' }, typeof args>>(true)
          // expect(args).toEqual({ mode: true })
          expect(() => Command.create({ '--mode': z.enum([`a`, `b`, `c`]) }).parseOrThrow([`--mode`, `bad`]))
            .toThrowErrorMatchingInlineSnapshot(`
              "Invalid argument for parameter: \\"mode\\". The error was:
              Invalid enum value. Expected 'a' | 'b' | 'c', received 'bad'"
            `)
        })
      })
      describe(`boolean`, () => {
        it(`when given, implies true`, () => {
          const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([`--verbose`])
          assert<IsExact<{ verbose: boolean }, typeof args>>(true)
          expect(args).toEqual({ verbose: true })
        })
        describe(`when default specified`, () => {
          it(`input can be omitted, default value used`, () => {
            const args = Command.create({ '--verbose': z.boolean().default(false) }).parseOrThrow([])
            assert<IsExact<{ verbose: boolean }, typeof args>>(true)
            expect(args).toEqual({ verbose: false })
          })
          it(`negation can be given`, () => {
            const args = Command.create({
              '--verbose': z.boolean().default(true),
            }).parseOrThrow([`--no-verbose`])
            assert<IsExact<{ verbose: boolean }, typeof args>>(true)
            expect(args).toEqual({ verbose: false })
          })
        })
        describe(`when optional`, () => {
          it(`specified input can be omitted, undefined is possible`, () => {
            const args = Command.create({ '--verbose': z.boolean().optional() }).parseOrThrow([])
            assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
            expect(args).toEqual({ verbose: undefined })
          })
          it(`input can be given`, () => {
            const args = Command.create({ '--verbose': z.boolean().optional() }).parseOrThrow([`--verbose`])
            assert<IsExact<{ verbose: boolean | undefined }, typeof args>>(true)
            expect(args).toEqual({ verbose: true })
          })
        })

        it(`A negated variant of the flag may be accepted`, () => {
          const args = Command.create({ '--verbose': z.boolean() }).parseOrThrow([`--no-verbose`])
          assert<IsExact<{ verbose: boolean }, typeof args>>(true)
          expect(args).toEqual({ verbose: false })
        })
      })
    })
  })
})
