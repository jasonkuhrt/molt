import { Command } from '../../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`errors`, () => {
  it.each(
    // prettier-ignore
    [
      [`when argument missing (last position)`,     { name: z.string() },                   { line: [`--name`] }],
      [`when argument missing (non-last position)`, { name: z.string(), age: z.number() },  { line: [`--name`, `--age`, `1`] }],
      [`when flag passed twice`,                    { '--name': z.string() },               { line: [`--name`, `1`, `--name`, `1`] }],
      [`when long and short flag passed `,          { '--name -n': z.string() },            { line: [`--name`, `1`, `-n`, `1`] }],
    ]
  )(`%s`, (_, parameters, input) => {
    expect(() =>
      Command.parameters(parameters).settings({ onError: `throw`, helpOnError: false }).parse(input)
    ).toThrowErrorMatchingSnapshot()
  })
})

describe(`optional`, () => {
  it(`specified input can be omitted, undefined is possible`, () => {
    const args = Command.parameters({ '--foo': z.string().optional() }).parse({ line: [] })
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ foo: undefined })
  })
  it(`input can be given`, () => {
    const args = Command.parameters({ '--foo': z.string().optional() }).parse({ line: [`--foo`, `bar`] })
    assert<IsExact<{ foo: string | undefined }, typeof args>>(true)
    expect(args).toMatchObject({ foo: `bar` })
  })
})

it(`is not trimmed by default`, () => {
  expect(Command.parameters({ name: z.string() }).parse({ line: [`--name`, `foobar  `] })).toMatchSnapshot()
})

describe(`zod`, () => {
  describe(`transformations`, () => {
    it.each(
      // prettier-ignore
      [
        [`trim`,                   { name: z.string().trim() },                         { line: [`--name`, `foobar   `] }],
      ]
    )(`%s`, (_, parameters, input) => {
      expect(Command.parameters(parameters).parse(input)).toMatchSnapshot()
    })
  })
  describe(`validation`, () => {
    it.each(
      // prettier-ignore
      [
        [`regex`,                   { name: z.string().regex(/[a-z]+/) },                         { line: [`--name`, `BAD`] }],
        [`min`,                     { name: z.string().min(5) },                                  { line: [`--name`, `BAD`] }],
        [`max`,                     { name: z.string().max(1) },                                  { line: [`--name`, `BAD`] }],
        [`url`,                     { name: z.string().url() },                                   { line: [`--name`, `BAD`] }],
        [`uuid`,                    { name: z.string().uuid() },                                  { line: [`--name`, `BAD`] }],
        [`cuid`,                    { name: z.string().cuid() },                                  { line: [`--name`, `BAD`] }],
        [`email`,                   { name: z.string().email() },                                 { line: [`--name`, `BAD`] }],
        [`length`,                  { name: z.string().length(1) },                               { line: [`--name`, `BAD`] }],
        [`endsWith`,                { name: z.string().endsWith(`x`) },                           { line: [`--name`, `BAD`] }],
        [`startsWith`,              { name: z.string().startsWith(`y`) },                         { line: [`--name`, `BAD`] }],
        [`datetime`,                { name: z.string().datetime() },                              { line: [`--name`, `BAD`] }],
        [`datetime no offset`,      { name: z.string().datetime({offset:false}) },                { line: [`--name`, `2023-02-25T08:01:28.364-05:00`] }],
        [`datetime precision 1`,    { name: z.string().datetime({precision:1}) },                 { line: [`--name`, `2023-02-25T08:01:28.364Z`] }],
      ]
    )(`%s`, (_, parameters, input) => {
      expect(() =>
        Command.parameters(parameters).settings({ onError: `throw`, helpOnError: false }).parse(input)
      ).toThrowErrorMatchingSnapshot()
    })
  })
})
