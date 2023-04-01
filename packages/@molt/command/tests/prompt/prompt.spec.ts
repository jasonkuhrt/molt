import type { Methods, Settings } from '../../src/entrypoints/types.js'
import { Command } from '../../src/index.js'
import { s, tryCatch } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'

let parameters: Methods.Parameters.InputAsConfig
let ttyReadsScript: string[]
let line: string[]
const settings: Settings.Input = {}

describe(`prompt can be configured at the parameter level`, () => {
  it(`prompt when missing input`, () => {
    parameters = { a: { schema: s.min(2), prompt: { when: { rejected: { name: `ErrorMissingArgument` } } } } }
    ttyReadsScript = [`foo`]
    line = []
    run()
  })

  it(`prompt when invalid input`, () => {
    parameters = { a: { schema: s.min(2), prompt: { when: { rejected: { name: `ErrorInvalidArgument` } } } } }
    ttyReadsScript = [`foo`]
    line = [`-a`, `1`]
    run()
  })

  it(`prompt when invalid input OR missing input`, () => {
    parameters = {
      a: {
        schema: s.min(2),
        prompt: { when: { rejected: { name: [`ErrorInvalidArgument`, `ErrorMissingArgument`] } } },
      },
    }
    ttyReadsScript = [`foo`]
    line = [`-a`, `1`]
    run()
  })

  it(`prompt when omitted`, () => {
    parameters = {
      a: {
        schema: s.min(2).optional(),
        prompt: { when: { omitted: { optionality: [`optional`, `default`] } } },
      },
    }
    ttyReadsScript = [`foo`]
    line = []
    run()
  })
  // todo the two tests below should be moved to pattern library tests
  it(`prompt when omitted (match optionality via wildcard)`, () => {
    parameters = {
      a: {
        schema: s.min(2).optional(),
        prompt: { when: { omitted: { optionality: true } } },
      },
    }
    ttyReadsScript = [`foo`]
    line = []
    run()
  })
  it(`prompt when omitted (match via wildcard)`, () => {
    parameters = {
      a: {
        schema: s.min(2).optional(),
        prompt: { when: { omitted: true } },
      },
    }
    ttyReadsScript = [`foo`]
    line = []
    run()
  })
})

// describe(`the default prompt can be configured at the command level`, () => {
//   it(``, () => {
//     parameters = { a: { schema: s.min(2) } }
//     settings = { prompt: { patterns: { $name: 'x', rejected: { name: [`ErrorInvalidArgument`, `ErrorMissingArgument`] } }} }
//     ttyReadsScript = [`foo`]
//     line = []
//     run()
//   })
// })

const run = () => {
  tty.script.userInputs(ttyReadsScript)
  const args = tryCatch(() =>
    Command.parameters(parameters)
      .settings({ onError: `throw`, helpOnError: false, ...settings })
      .parse({ line, tty: tty.interface })
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.state.history.full).toMatchSnapshot(`tty`)
  expect(tty.state.history.full.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
}

describe(`types`, () => {
  it(`rejected name must be a valid string literal`, () => {
    parameters = {
      a: {
        schema: s.min(2),
        prompt: {
          when: {
            rejected: {
              // @ts-expect-error invalid type
              name: `bad`,
            },
          },
        },
      },
    }
  })
})

// it.each(
//   // prettier-ignore
//   [
//     [`a required parameter can be given at prompt`,                                               { a: { schema: s, prompt: true } },             [], [`foo`]],
//     [`a required parameter given by flag is not asked for in prompt`,                             { a: { schema: s, prompt: true } },             [`-a`,`foo`], []],
//     [`a required parameter opted out of prompt is not prompted for`,                              { a: { schema: s, prompt: false } },            [], []],
//     [`an optional parameter can be skipped at prompt`,                                            { a: { schema: s.optional(), prompt: true } },  [], []],
//     [`by default parameter prompt is disabled`,                                                   { a: { schema: s } },                           [], []],
//     [`prompt input is validated`,                                                                 { a: { schema: s.min(2), prompt:true } },       [], [`x`,`xx`]],
//     // todo we may want to change this behavior
//     [`a parameter with prompt enabled given an invalid value at line does not prompt`,            { a: { schema: s.min(2), prompt: true } },      [`-a`,`x`], []],
//     [`shows progress gutter even when there is only one thing to prompt`,                         { a: { schema: s, prompt: true } },             [], [`foo`]],
//   ] satisfies [description: string, config:any, line:string[], tty:string[]][]
// )(`%s`, (_, parameters, line, ttyReadsScript) => {
//   tty.script.userInputs(ttyReadsScript)
//   const args = tryCatch(() =>
//     Command.parameters(parameters)
//       .settings({ onError: `throw`, helpOnError: false })
//       .parse({ line, tty: tty.interface })
//   )
//   expect(args).toMatchSnapshot(`args`)
//   expect(tty.state.history.full).toMatchSnapshot(`tty`)
//   expect(tty.state.history.full.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
// })

// it(`when there is no tty then prompt is skipped`, () => {
//   // When running in Vitest it is already false
//   // process.stdout.isTTY = false
//   const args = tryCatch(() =>
//     Command.parameters({ a: { schema: s, prompt: true } })
//       .settings({ onError: `throw`, helpOnError: false })
//       .parse({ line: [] })
//   )
//   expect(args).toMatchSnapshot(`args`)
//   expect(tty.state.history.full).toMatchSnapshot(`tty`)
//   expect(tty.state.history.full.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
// })
