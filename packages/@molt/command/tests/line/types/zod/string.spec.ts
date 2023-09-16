import { Command } from '../../../../src/index.js'
import { s } from '../../../_/helpers.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`zod`, () => {
  describe(`transformations`, () => {
    it.each(
      // prettier-ignore
      [
        [`trim`,                   { name: s.trim() },                         { line: [`--name`, `foobar   `] }],
        [`toLowerCase`,            { name: s.toLowerCase() },                  { line: [`--name`, `FOOBAR   `] }],
        [`toUpperCase`,            { name: s.toUpperCase() },                  { line: [`--name`, `foobar   `] }],
      ],
    )(`%s`, (_, parameters, input) => {
      expect(
        Object.entries(parameters)
          .reduce((chain, data) => chain.parameter(data[0] as any, data[1]), Command.create())
          .parse(input),
      ).toMatchSnapshot()
    })
  })
  describe(`validation`, () => {
    it.each(
      // prettier-ignore
      [
        [`regex`,                   { foo: z.string().regex(/[a-z]+/) },                         { line: [`--foo`, `BAD`] }],
        [`min`,                     { foo: z.string().min(5) },                                  { line: [`--foo`, `BAD`] }],
        [`max`,                     { foo: z.string().max(1) },                                  { line: [`--foo`, `BAD`] }],
        [`url`,                     { foo: z.string().url() },                                   { line: [`--foo`, `BAD`] }],
        [`uuid`,                    { foo: z.string().uuid() },                                  { line: [`--foo`, `BAD`] }],
        [`cuid`,                    { foo: z.string().cuid() },                                  { line: [`--foo`, `BAD`] }],
        [`cuid2`,                   { foo: z.string().cuid2() },                                 { line: [`--foo`, `BAD`] }],
        [`email`,                   { foo: z.string().email() },                                 { line: [`--foo`, `BAD`] }],
        [`length`,                  { foo: z.string().length(1) },                               { line: [`--foo`, `BAD`] }],
        [`endsWith`,                { foo: z.string().endsWith(`x`) },                           { line: [`--foo`, `BAD`] }],
        [`startsWith`,              { foo: z.string().startsWith(`y`) },                         { line: [`--foo`, `BAD`] }],
        [`datetime`,                { foo: z.string().datetime() },                              { line: [`--foo`, `BAD`] }],
        [`datetime no offset`,      { foo: z.string().datetime({offset:false}) },                { line: [`--foo`, `2023-02-25T08:01:28.364-05:00`] }],
        [`datetime precision 1`,    { foo: z.string().datetime({precision:1}) },                 { line: [`--foo`, `2023-02-25T08:01:28.364Z`] }],
        [`includes`,                { foo: z.string().includes(`z`) },                           { line: [`--foo`, `BAD`] }],
        [`emoji`,                   { foo: z.string().emoji() },                                 { line: [`--foo`, `BAD`] }],
        [`ulid`,                    { foo: z.string().ulid() },                                  { line: [`--foo`, `BAD`] }],
        [`ip`,                      { foo: z.string().ip() },                                    { line: [`--foo`, `BAD`] }],
        [`ipv4`,                    { foo: z.string().ip({version:'v4'}) },                      { line: [`--foo`, `BAD`] }],
        [`ipv6`,                    { foo: z.string().ip({version:'v6'}) },                      { line: [`--foo`, `BAD`] }],
      ],
    )(`%s`, (_, parameters, input) => {
      expect(() => {
        Object.entries(parameters)
          .reduce((chain, data) => chain.parameter(data[0] as any, data[1]), Command.create())
          .settings({ onError: `throw`, helpOnError: false })
          .parse(input)
      }).toThrowErrorMatchingSnapshot()
    })
  })
})
