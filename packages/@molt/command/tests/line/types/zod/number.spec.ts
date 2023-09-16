import { Command } from '../../../../src/index.js'
import { l1, n } from '../../../_/helpers.js'
import { describe, expect, it } from 'vitest'

describe(`zod`, () => {
  describe(`validation`, () => {
    it.each(
      // prettier-ignore
      [
        [`literal int`,             { name: l1 },                                      { line: [`--name`, `2`] }],
        [`int`,                     { name: n.int() },                                  { line: [`--name`, `5.4`] }],
        [`min`,                     { name: n.min(5) },                                 { line: [`--name`, `1`] }],
        [`max`,                     { name: n.max(1) },                                 { line: [`--name`, `5`] }],
        [`multipleOf`,              { name: n.multipleOf(5) },                          { line: [`--name`, `2`] }],
        // TOOD allow expressing infinity on CLI???
        // [`finite`,                     { name: z.number().finite() },                                  { line: [`--name`, `5`] }],
      ],
    )(`%s`, (_, parameters, input) => {
      expect(() => {
        // eslint-disable-next-line
        Object.entries(parameters)
          // @ts-expect-error todo
          .reduce((chain, data) => {
            return chain.parameter(data[0] as any, data[1])
          }, Command.create())
          // @ts-expect-error todo
          .settings({ onError: `throw`, helpOnError: false })
          .parse(input)
      }).toThrowErrorMatchingSnapshot()
    })
  })
})
