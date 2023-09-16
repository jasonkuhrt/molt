import { entries } from '../../../src/helpers.js'
import { Command } from '../../../src/index.js'
import { s } from '../../_/helpers.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`zod`, () => {
  describe(`transformations`, () => {
    it.each(
      // prettier-ignore
      [
        [`trim`,                   { a: s.trim() },                         { line: [`-a`, `abar   `] }],
        [`toLowerCase`,            { a: s.toLowerCase() },                  { line: [`-a`, `aBAR   `] }],
        [`toUpperCase`,            { a: s.toUpperCase() },                  { line: [`-a`, `abar   `] }],
      ],
    )(`%s`, (_, parameters, input) => {
      expect(
        entries(parameters)
          .reduce((chain, data) => chain.parameter(data[0] as any, data[1]), Command.create())
          .parse(input),
      ).toMatchSnapshot()
    })
  })
  describe(`validation`, () => {
    it.each(
      // prettier-ignore
      [
        [`regex`,                   { a: z.string().regex(/[a-z]+/) },                         { line: [`-a`, `BAD`] }],
        [`min`,                     { a: z.string().min(5) },                                  { line: [`-a`, `BAD`] }],
        [`max`,                     { a: z.string().max(1) },                                  { line: [`-a`, `BAD`] }],
        [`url`,                     { a: z.string().url() },                                   { line: [`-a`, `BAD`] }],
        [`uuid`,                    { a: z.string().uuid() },                                  { line: [`-a`, `BAD`] }],
        [`cuid`,                    { a: z.string().cuid() },                                  { line: [`-a`, `BAD`] }],
        [`cuid2`,                   { a: z.string().cuid2() },                                 { line: [`-a`, `BAD`] }],
        [`email`,                   { a: z.string().email() },                                 { line: [`-a`, `BAD`] }],
        [`length`,                  { a: z.string().length(1) },                               { line: [`-a`, `BAD`] }],
        [`endsWith`,                { a: z.string().endsWith(`x`) },                           { line: [`-a`, `BAD`] }],
        [`startsWith`,              { a: z.string().startsWith(`y`) },                         { line: [`-a`, `BAD`] }],
        [`datetime`,                { a: z.string().datetime() },                              { line: [`-a`, `BAD`] }],
        [`datetime no offset`,      { a: z.string().datetime({offset:false}) },                { line: [`-a`, `2023-02-25T08:01:28.364-05:00`] }],
        [`datetime precision 1`,    { a: z.string().datetime({precision:1}) },                 { line: [`-a`, `2023-02-25T08:01:28.364Z`] }],
        [`includes`,                { a: z.string().includes(`z`) },                           { line: [`-a`, `BAD`] }],
        [`emoji`,                   { a: z.string().emoji() },                                 { line: [`-a`, `BAD`] }],
        [`ulid`,                    { a: z.string().ulid() },                                  { line: [`-a`, `BAD`] }],
        [`ip`,                      { a: z.string().ip() },                                    { line: [`-a`, `BAD`] }],
        [`ipv4`,                    { a: z.string().ip({version:`v4`}) },                      { line: [`-a`, `BAD`] }],
        [`ipv6`,                    { a: z.string().ip({version:`v6`}) },                      { line: [`-a`, `BAD`] }],
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
