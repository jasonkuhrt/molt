import type { ParameterConfiguration } from '../../src/Builder/root/types.js'
import type { Settings } from '../../src/entrypoints/types.js'
import { Command } from '../../src/index.js'
import { s, tryCatch } from '../_/helpers.js'
import { tty } from '../_/mocks/tty.js'
import stripAnsi from 'strip-ansi'
import { expect, it } from 'vitest'

// TODO test that prompt order is based on order of parameter definition

let parameters: Record<string, ParameterConfiguration>
let ttyInputs: string[]
let line: string[]
const settings: Settings.Input = {}

it(`can be explicitly disabled`, () => {
  parameters = {
    a: {
      schema: s,
      prompt: { enabled: false },
    },
  }
  ttyInputs = []
  line = []
  run()
})

it(`can be explicitly disabled with a "when" condition present`, () => {
  parameters = {
    a: {
      schema: s.min(2),
      prompt: { enabled: false, when: { result: `rejected`, error: `ErrorMissingArgument` } },
    },
  }
  ttyInputs = []
  line = []
  run()
})

it.only(`prompt when missing input`, () => {
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
  parameters = {
    a: {
      schema: s.min(2).optional(),
      // @ts-expect-error todo
      prompt: { when: { result: `omitted`, spec: { optionality: [`default`, `optional`] } } },
    },
  }
  ttyInputs = [`foo`]
  line = []
  run()
})

it(`static error to match on omitted event on required parameter by .parameter(...)`, () => {
  // @ts-expect-error not available
  Command.parameter(`a`, { schema: s, prompt: { when: { result: `omitted` } } })
  // Is fine, because parameter is optional.
  Command.parameter(`a`, {
    schema: s.optional(),
    prompt: { when: { result: `omitted` } },
  })
})

it(`can pass just one pattern in multiple pattern syntax`, () => {
  Command.parameter(`a`, s).settings({ prompt: { when: [{ result: `accepted` }] } })
})

it(`static error to match on omitted event on command level when no parameters have optional`, () => {
  // @ts-expect-error not available
  Command.parameter(`a`, s).settings({ prompt: { when: { result: `omitted` } } })
  // Is fine, because parameter is optional.
  Command.parameter(`a`, s.optional()).settings({ prompt: { when: { result: `omitted` } } })
  // Is fine, because at least one parameter is optional.
  Command.parameter(`a`, s.optional())
    .parameter(`b`, s)
    .settings({ prompt: { when: { result: `omitted` } } })
})

// TODO should be able match on common event properties _without_ specifying the event type...
// Command.parameter(`a`, s).settings({
//   prompt: { when: { spec: { name: { aliases: { long: [`a`, `b`] } } } } },
// })

// TODO already taken care of by match test suite?
it(`array value`, () => {
  // Can pass ONE literal match
  Command.parameter(`a`, s).settings({
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [`a`, `b`] } } } } },
  })
  // can pass an OR literal match
  Command.parameter(`a`, s).settings({
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [[`a`, `b`], [`c`]] } } } } },
  })
  Command.parameter(`a`, s).settings({
    // @ts-expect-error Cannot pass the array member literal
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: `a` } } } } },
  })
  Command.parameter(`a`, s).settings({
    // @ts-expect-error Cannot mix OR and ONE matches
    prompt: { when: { result: `accepted`, spec: { name: { aliases: { long: [`a`, [`b`]] } } } } },
  })
})

it(`static error when fields from different event types matched in single pattern`, () => {
  // @ts-expect-error "value" is not available on "rejected" event
  Command.parameter(`a`, s).settings({ prompt: { when: { result: `rejected`, value: 1 } } })
  // TODO excess properties should be an error in the pattern match but for some reason are not being here.
  Command.parameter(`a`, {
    schema: s,
    prompt: {
      when: {
        result: `rejected`,
        error: `ErrorInvalidArgument`,
        value: 1,
        foo: 2,
        blah: 3,
        '........ :(': 1,
      },
    },
  })
})

/**
 *
 * Helpers
 *
 */

const run = () => {
  tty.mock.input.add(ttyInputs)
  // eslint-disable-next-line
  const args = tryCatch(() => {
    return (
      // eslint-disable-next-line
      Object.entries(parameters)
        // @ts-expect-error todo
        .reduce((chain, data) => {
          return chain.parameter(data[0] as any, data[1])
        }, Command)
        // @ts-expect-error todo
        .settings({ onError: `throw`, helpOnError: false, ...settings })
        .parse({ line, tty: tty.interface })
    )
  })
  expect(args).toMatchSnapshot(`args`)
  expect(tty.history.all).toMatchSnapshot(`tty`)
  expect(tty.history.all.map((_) => stripAnsi(_))).toMatchSnapshot(`tty strip ansi`)
}
