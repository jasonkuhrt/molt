import { Command } from '../../src/index.js'
import { s } from '../_/helpers.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'
import { z } from 'zod'

const processStdout = mockProcessStdout()
mockProcessExit()

it(`if there is optional param it is shown`, () => {
  Command.parameters({ a: s.optional() }).parse({ line: [`-h`] })
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if there are one or more parameter descriptions then call the "type" col header "type/description"`, () => {
  Command.parameters({ a: s.optional().describe(`Blah blah blah blah.`) }).parse({ line: [`-h`] })
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

// it(`if parameter has description it is shown`, () => {
//   Command.parameters({ a: s.optional().describe(`Blah blah blah.`) }).parse({ line: [`-h`] })
//   const output = processStdout.mock.lastCall?.[0] as string
//   expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
//   expect(output).toMatchSnapshot(`polychrome`)
// })

it(`long description wraps within column`, () => {
  Command.parameters({
    a: s.optional().describe(`Blah blah blah. Blah blah blah. Blah blah blah.`),
  }).parse({ line: [`-h`] })
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if parameter has default it is shown`, () => {
  Command.parameters({ foo: s.default(`bar`) }).parse({ line: [`-h`] })
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if parameter is optional without default then its default shows up as "undefined"`, () => {
  Command.parameters({ foo: s.optional() }).parse({ line: [`-h`] })
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  Command.parameters({
    foo: s.default(() => {
      throw new Error(`whoops`)
    }),
  }).parse({ line: [`-h`] })
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  Command.parameters({
    foo: s.default(() => {
      throw new Error(`whoops`)
    }),
  }).parse({ line: [`-h`] })
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`enums do not mess up alignment when they are widest line in the column`, () => {
  // prettier-ignore
  Command.parameters({
    foo: z.enum([`a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `o`, `p`, `q`, `r`, `s`, `t`, `u`, `v`, `w`, `x`, `y`, `z`]),
    bar: s.optional(),
  }).parse({line:[`-h`]})
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

describe(`enum`, () => {
  it(`enum members are listed`, () => {
    Command.parameters({ foo: z.enum([`apple`, `dolphin`, `cab`]) }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })

  it(`optional enum members are listed`, () => {
    Command.parameters({ foo: z.enum([`apple`, `dolphin`, `cab`]).optional() }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })

  it(`when there is only one enum member it is prefixed with "enum:" to avoid confusion of it looking like the name of a kind of type`, () => {
    Command.parameters({ foo: z.enum([`apple`]) }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })

  it(`when there are many members they wrap`, () => {
    Command.parameters({
      foo: z.enum([
        `apple`,
        `baby`,
        `cannabis`,
        `dinosaur`,
        `elephant`,
        `fanna`,
        `goat`,
        `house`,
        `island`,
        `jake`,
        `kilomanjara`,
      ]),
    }).parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
})

describe(`environment`, () => {
  it(`when environment is disabled then environment doc is not shown`, () => {
    Command.parameters({ foo: s })
      .settings({ parameters: { environment: false } })
      .parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is enabled it shows as the last column`, () => {
    Command.parameters({ foo: s })
      .settings({ parameters: { environment: true } })
      .parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is disabled for one parameter it has X indicating that`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({ parameters: { environment: { $default: true, foo: false } } })
      .parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has custom prefix it is displayed`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({ parameters: { environment: { $default: true, foo: { prefix: `moo` } } } })
      .parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has multiple custom prefix they are displayed`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({ parameters: { environment: { $default: true, foo: { prefix: [`moo`, `boo`] } } } })
      .parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has no prefix it is displayed`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({ parameters: { environment: { $default: true, foo: { prefix: false } } } })
      .parse({ line: [`-h`] })
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
})

describe(`exclusive`, () => {
  describe(`optional`, () => {
    it(`shows exclusive parameters as a group`, () => {
      Command.parametersExclusive(`foo`, (_) =>
        _.parameter(`b bar`, s).parameter(`z baz`, s).optional()
      ).parse({
        line: [`-h`],
      })
      const output = processStdout.mock.lastCall?.[0] as string
      expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
      expect(output).toMatchSnapshot(`polychrome`)
    })
  })
})
