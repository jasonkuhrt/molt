import { expect, test } from 'vitest'
import { $, b } from '../../_/helpers.js'
import { environmentManager } from '../__helpers__.js'

test.each([
  [`true`, { foo: true }],
  [`false`, { foo: false }],
  [`1`, { foo: true }],
  [`0`, { foo: false }],
])(`%s`, (value, expected) => {
  environmentManager.set(`cli_param_foo`, value)
  expect($.parameter(`foo`, b).parse({ line: [] })).toMatchObject(expected)
})
