import { Command } from '../../src/index.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'
import { mockProcessExit, mockProcessStdout } from 'vitest-mock-process'
import { z } from 'zod'

const processStdout = mockProcessStdout()
mockProcessExit()

it(`if there is optional param it is shown`, () => {
  Command.create({ a: z.string().optional() }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if parameter has description it is shown`, () => {
  Command.create({ a: z.string().optional().describe(`Blah blah blah.`) }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`long description wraps within column`, () => {
  Command.create({
    a: z.string().optional().describe(`Blah blah blah. Blah blah blah. Blah blah blah.`),
  }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if parameter has default it is shown`, () => {
  Command.create({ foo: z.string().default(`bar`) }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if parameter is optional without default then its default shows up as "undefined"`, () => {
  Command.create({ foo: z.string().optional() }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  Command.create({
    foo: z.string().default(() => {
      throw new Error(`whoops`)
    }),
  }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  Command.create({
    foo: z.string().default(() => {
      throw new Error(`whoops`)
    }),
  }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

it(`enums do not mess up alignment when they are widest line in the column`, () => {
  // prettier-ignore
  Command.create({
    foo: z.enum([`a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `o`, `p`, `q`, `r`, `s`, `t`, `u`, `v`, `w`, `x`, `y`, `z`]),
    bar: z.string().optional(),
  }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

describe(`enum`, () => {
  it(`enum members are listed`, () => {
    Command.create({ foo: z.enum([`apple`, `dolphin`, `cab`]) }).parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })

  it(`optional enum members are listed`, () => {
    Command.create({ foo: z.enum([`apple`, `dolphin`, `cab`]).optional() }).parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })

  it(`when there is only one enum member it is prefixed with "enum:" to avoid confusion of it looking like the name of a kind of type`, () => {
    Command.create({ foo: z.enum([`apple`]) }).parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })

  it(`when there are many members they wrap`, () => {
    Command.create({
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
    }).parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
})

describe(`environment`, () => {
  it(`when environment is disabled then environment doc is not shown`, () => {
    Command.create({ foo: z.string() })
      .settings({ parameters: { environment: false } })
      .parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is enabled it shows as the last column`, () => {
    Command.create({ foo: z.string() })
      .settings({ parameters: { environment: true } })
      .parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is disabled for one parameter it has X indicating that`, () => {
    Command.create({ foo: z.string(), bar: z.string() })
      .settings({ parameters: { environment: { $default: true, foo: false } } })
      .parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has custom prefix it is displayed`, () => {
    Command.create({ foo: z.string(), bar: z.string() })
      .settings({ parameters: { environment: { $default: true, foo: { prefix: `moo` } } } })
      .parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has multiple custom prefix they are displayed`, () => {
    Command.create({ foo: z.string(), bar: z.string() })
      .settings({ parameters: { environment: { $default: true, foo: { prefix: [`moo`, `boo`] } } } })
      .parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has no prefix it is displayed`, () => {
    Command.create({ foo: z.string(), bar: z.string() })
      .settings({ parameters: { environment: { $default: true, foo: { prefix: false } } } })
      .parseOrThrow([`-h`])
    const output = processStdout.mock.lastCall?.[0] as string
    expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
    expect(output).toMatchSnapshot(`polychrome`)
  })
})
