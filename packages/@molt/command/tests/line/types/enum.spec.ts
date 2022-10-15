import { Command } from '../../../src/index.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`errors`, () => {
  it(`when argument missing (last position)`, () => {
    expect(() =>
      Command.create({ '--mode': z.enum([`a`, `b`]) }).parseOrThrow([`--mode`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument"`)
  })
  it(`when argument missing (non-last position)`, () => {
    expect(() =>
      // prettier-ignore
      Command.create({ '--name': z.string(), '--mode': z.enum([`a`,`b`]) }).parseOrThrow([` --mode`, `--name`, `joe`])
    ).toThrowErrorMatchingInlineSnapshot(`"Missing argument"`)
  })
})

it(`is validated`, () => {
  // const args = Parameters.create({ '--mode': z.enum([`a`, `b`, `c`]) }).parseOrThrow([`--mode`, `bad`])
  // assert<IsExact<{ mode: 'a'|'b'|'c' }, typeof args>>(true)
  // expect(args).toMatchObject({ mode: true })
  expect(() =>
    Command.create({ '--mode': z.enum([`a`, `b`, `c`]) }).parseOrThrow([`--mode`, `bad`])
  ).toThrowErrorMatchingInlineSnapshot(`"Invalid value for mode: todo"`)
})
