import { Command } from '../../src/index.js'
import { s, tryCatch } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import { expect, it } from 'vitest'

it.each(
  // prettier-ignore
  [
    [`a required parameter can be given at prompt`,                   { a: { schema: s, prompt: true } },             [], [`foo`]],
    [`a required parameter given by flag is not asked for in prompt`, { a: { schema: s, prompt: true } },             [`-a`,`foo`], []],
    [`a required parameter opted out of prompt is not prompted for`,  { a: { schema: s, prompt: false } },            [], []],
    [`an optional parameter can be skipped at prompt`,                { a: { schema: s.optional(), prompt: true } },  [], []],
    [`by default parameter prompt is disabled`,                       { a: { schema: s } },                           [], []],
    //todo
    [`prompt input is validated`,                                     { a: { schema: s.min(2), prompt:true } },       [], [`x`]],
  ] satisfies [string, any, string[], string[]][]
)(`%s`, (_, parameters, line, ttyReadsScript) => {
  tty.script.reads(ttyReadsScript)
  const args = tryCatch(() =>
    Command.parameters(parameters)
      .settings({ onError: `throw`, helpOnError: false })
      .parse({ line, tty: tty.interface })
  )

  expect(args).toMatchSnapshot(`args`)
  expect(tty.state.history.full).toMatchSnapshot(`tty`)
})
