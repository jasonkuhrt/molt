import { Command } from '../../../src/index.js'
import { b } from '../../_/helpers.js'
import { environmentManager } from '../__helpers__.js'
import { expect, test } from 'vitest'

test.each([
  [`true`, { foo: true }],
  [`false`, { foo: false }],
  [`1`, { foo: true }],
  [`0`, { foo: false }],
])(`%s`, (value, expected) => {
  environmentManager.set(`cli_param_foo`, value)
  expect(Command.parameter(`foo`, b).parse({ line: [] })).toMatchObject(expected)
})
