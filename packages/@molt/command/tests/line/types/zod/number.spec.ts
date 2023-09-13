import { Command } from '../../../../src/index.js'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`zod`, () => {
  describe(`validation`, () => {
    it.each(
      // prettier-ignore
      [
        [`literal int`,             { name: z.literal(1) },                                      { line: [`--name`, `2`] }],
        [`int`,                     { name: z.number().int() },                                  { line: [`--name`, `5.4`] }],
        [`min`,                     { name: z.number().min(5) },                                 { line: [`--name`, `1`] }],
        [`max`,                     { name: z.number().max(1) },                                 { line: [`--name`, `5`] }],
        [`multipleOf`,              { name: z.number().multipleOf(5) },                          { line: [`--name`, `2`] }],
        // TOOD allow expressing infinity on CLI???
        // [`finite`,                     { name: z.number().finite() },                                  { line: [`--name`, `5`] }],
      ],
    )(`%s`, (_, parameters, input) => {
      expect(() =>
        Command.parameters(parameters).settings({ onError: `throw`, helpOnError: false }).parse(input),
      ).toThrowErrorMatchingSnapshot()
    })
  })
})
