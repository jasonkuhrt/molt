import { Command } from '../../src/index.js'
import stripAnsi from 'strip-ansi'
import { expect, it } from 'vitest'
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
  Command.create({ a: z.string().default(`foobar`) }).parseOrThrow([`-h`])
  const output = processStdout.mock.lastCall?.[0] as string
  expect(stripAnsi(output)).toMatchSnapshot(`monochrome`)
  expect(output).toMatchSnapshot(`polychrome`)
})

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
