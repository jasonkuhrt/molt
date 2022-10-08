import { Command } from '../../../src/index.js'
import { environmentManager } from '../__helpers__.js'
import { expect, test } from 'vitest'
import { z } from 'zod'

test.each([
  [`true`, { foo: true }],
  [`false`, { foo: false }],
  [`1`, { foo: true }],
  [`0`, { foo: false }],
])(`%s`, (value, expected) => {
  environmentManager.set(`cli_param_foo`, value)
  expect(Command.create({ foo: z.boolean() }).parseOrThrow([])).toEqual(expected)
})
