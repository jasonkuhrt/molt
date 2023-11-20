import { $, l1, n } from '../../_/helpers.js'
import { describe, expect, it } from 'vitest'

describe(`zod`, () => {
  describe(`validation`, () => {
    it.each(
      [
        [`literal int`, { a: l1 }, { line: [`-a`, `2`] }],
        [`int`, { a: n.int() }, { line: [`-a`, `5.4`] }],
        [`min`, { a: n.min(5) }, { line: [`-a`, `1`] }],
        [`max`, { a: n.max(1) }, { line: [`-a`, `5`] }],
        [`multipleOf`, { a: n.multipleOf(5) }, { line: [`-a`, `2`] }],
        // TOOD allow expressing infinity on CLI???
        // [`finite`,                     { a: z.number().finite() },                                  { line: [`-a`, `5`] }],
      ],
    )(`%s`, (_, parameters, input) => {
      expect(() => {
        // eslint-disable-next-line
        Object.entries(parameters)
          // @ts-expect-error todo
          .reduce((chain, data) => {
            return chain.parameter(data[0] as any, data[1])
          }, $)
          // @ts-expect-error todo
          .settings({ onError: `throw`, helpOnError: false })
          .parse(input)
      }).toThrowErrorMatchingSnapshot()
    })
  })
})
