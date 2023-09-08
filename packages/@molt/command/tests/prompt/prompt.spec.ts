import type { Schema } from '../../src/Builder/root/types.js'
import type { Settings } from '../../src/entrypoints/types.js'
import { Methods } from '../../src/entrypoints/types.js'
import { Command } from '../../src/index.js'
import { s, tryCatch } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'

let parameters: Methods.Parameters.InputAsConfig<Schema>
let ttyInputs: string[]
let line: string[]
const settings: Settings.Input = {}

describe(`prompt can be configured at the parameter level`, () => {
  it(`prompt when missing input`, () => {
    parameters = {
      a: { schema: s.min(2), prompt: { when: { result: `rejected`, error: `ErrorMissingArgument` } } },
    }
    ttyInputs = [`foo`]
    line = []
    run()
  })

  it(`prompt when invalid input`, () => {
    parameters = {
      a: { schema: s.min(2), prompt: { when: { result: `rejected`, error: `ErrorInvalidArgument` } } },
    }
    ttyInputs = [`foo`]
    line = [`-a`, `1`]
    run()
  })

  it(`prompt when invalid input OR missing input`, () => {
    parameters = {
      a: {
        schema: s.min(2),
        prompt: { when: { result: `rejected`, error: [`ErrorInvalidArgument`, `ErrorMissingArgument`] } },
      },
    }
    ttyInputs = [`foo`]
    line = [`-a`, `1`]
    run()
  })

  it(`prompt when omitted`, () => {
    parameters = Methods.Parameters.parameters({
      a: {
        schema: s.min(2).optional(),
        prompt: { when: { result: `omitted`, spec: { optionality: [`default`, `optional`] } } },
      },
    })
    ttyInputs = [`foo`]
    line = []
    run()
  })

  it(`static error to match on omitted event on required parameter`, () => {
    // @ts-expect-error not available
    Command.parameters({ a: { schema: s, prompt: { when: { result: `omitted` } } } })
    // Is fine, because parameter is optional.
    Command.parameters({ a: { schema: s.optional(), prompt: { when: { result: `omitted` } } } })
  })
})

const run = () => {
  tty.mock.input.add(ttyInputs)
  const args = tryCatch(() =>
    Command.parameters(parameters)
      .settings({ onError: `throw`, helpOnError: false, ...settings })
      .parse({ line, tty: tty.interface }),
  )
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
}

describe(`types`, () => {
  it(`rejected name must be a valid string literal`, () => {
    parameters = {
      a: {
        schema: s.min(2),
        prompt: {
          when: {
            // @ts-expect-error invalid type
            rejected: {
              name: `bad`,
            },
          },
        },
      },
    }
  })
})
