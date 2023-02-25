import { Command } from '../../../../src/index.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

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
