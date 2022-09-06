import * as Lib from './index.js'
import { expect, test } from 'vitest'

test(`imports using paths config works relative`, () => {
  expect(Lib.todo()).toEqual(`nothing`)
})
