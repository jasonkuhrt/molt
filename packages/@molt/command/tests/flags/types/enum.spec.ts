import { Command } from '../../../src/index.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`errors`, () => {
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
