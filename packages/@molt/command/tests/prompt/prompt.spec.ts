import { Command } from '../../src/index.js'
import { s } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import { expect, it } from 'vitest'

it.each(
  // prettier-ignore
  [
    [`a required parameter can be given at prompt`, { a: { schema: s, prompt: true } }, [], [`foo`]],
  ] satisfies [string, any, string[], string[]][]
)(`%s`, (_, parameters, line, ttyReadsScript) => {
  tty.script.reads(ttyReadsScript)
  const args = Command.parameters(parameters)
    .settings({ onError: `throw` })
    .parse({ line, tty: tty.interface })
  expect(args).toMatchSnapshot()
  expect(tty.state.history.full).toMatchSnapshot()
})
