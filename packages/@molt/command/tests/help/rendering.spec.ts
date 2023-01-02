import { Command } from '../../src/index.js'
import { s } from '../_/helpers.js'
import { createState } from '../environment/__helpers__.js'
import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'
import { mockProcessExit } from 'vitest-mock-process'
import { z } from 'zod'

mockProcessExit()

const output = createState<string>({
  value: (values) => values.join(``),
})
const onOutput = output.set

it(`if there is optional param it is shown`, () => {
  Command.parameters({ a: s.optional() })
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if parameter has description it is shown`, () => {
  Command.parameters({ a: s.optional().describe(`Blah blah blah.`) })
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`long description wraps within column`, () => {
  Command.parameters({
    a: s.optional().describe(`Blah blah blah. Blah blah blah. Blah blah blah.`),
  })
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if parameter has default it is shown`, () => {
  Command.parameters({ foo: s.default(`bar`) })
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if parameter is optional without default then its default shows up as "undefined"`, () => {
  Command.parameters({ foo: s.optional() })
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  Command.parameters({
    foo: s.default(() => {
      throw new Error(`whoops`)
    }),
  })
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  Command.parameters({
    foo: s.default(() => {
      throw new Error(`whoops`)
    }),
  })
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`enums do not mess up alignment when they are widest line in the column`, () => {
  // prettier-ignore
  Command.parameters({
    foo: z.enum([`a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `i`, `j`, `k`, `l`, `m`, `n`, `o`, `p`, `q`, `r`, `s`, `t`, `u`, `v`, `w`, `x`, `y`, `z`]),
    bar: s.optional(),
  }).settings({onOutput}).parse({line:[`-h`]})
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

describe(`enum`, () => {
  it(`enum members are listed`, () => {
    Command.parameters({ foo: z.enum([`apple`, `dolphin`, `cab`]) })
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })

  it(`optional enum members are listed`, () => {
    Command.parameters({ foo: z.enum([`apple`, `dolphin`, `cab`]).optional() })
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })

  it(`when there is only one enum member it is prefixed with "enum:" to avoid confusion of it looking like the name of a kind of type`, () => {
    Command.parameters({ foo: z.enum([`apple`]) })
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
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
    })
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
})

describe(`environment`, () => {
  it(`when environment is disabled then environment doc is not shown`, () => {
    Command.parameters({ foo: s })
      .settings({ onOutput, parameters: { environment: false } })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is enabled it shows as the last column`, () => {
    Command.parameters({ foo: s })
      .settings({ onOutput, parameters: { environment: true } })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is disabled for one parameter it has X indicating that`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({ onOutput, parameters: { environment: { $default: true, foo: false } } })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has custom prefix it is displayed`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({ onOutput, parameters: { environment: { $default: true, foo: { prefix: `moo` } } } })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has multiple custom prefix they are displayed`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({
        onOutput,
        parameters: { environment: { $default: true, foo: { prefix: [`moo`, `boo`] } } },
      })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has no prefix it is displayed`, () => {
    Command.parameters({ foo: s, bar: s })
      .settings({ onOutput, parameters: { environment: { $default: true, foo: { prefix: false } } } })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
})

describe(`exclusive`, () => {
  describe(`optional`, () => {
    it(`shows exclusive parameters as a group`, () => {
      Command.parametersExclusive(`foo`, (_) => _.parameter(`b bar`, s).parameter(`z baz`, s).optional())
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
  })
  describe(`default`, () => {
    it(`shows the group default`, () => {
      Command.parametersExclusive(`foo`, (_) =>
        _.parameter(`b bar`, s).parameter(`z baz`, s).default(`bar`, `bar_default`)
      )
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
  })
})

describe(`union parameter`, () => {
  describe(`condensed pipe style`, () => {
    it(`used when no descriptions given for anything`, () => {
      Command.parameter(`b bar`, z.union([z.string(), z.number()]))
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
    it(`used when only overall description given`, () => {
      Command.parameter(`b bar`, z.union([z.string(), z.number()]).describe(`Blah blah blah.`))
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
  })
  describe(`verbose style`, () => {
    it(`shows member on each line if each has description`, () => {
      Command.parameter(
        `b bar`,
        z.union([
          z.string().describe(`Blah blah blah string.`),
          z.number().describe(`Blah blah blah number.`),
        ])
      )
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
    it(`shows member on each line if at least one has description`, () => {
      Command.parameter(`b bar`, z.union([z.string(), z.number().describe(`Blah blah blah number.`)]))
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
    it(`shows overall description above all members when members also have descriptions`, () => {
      Command.parameter(
        `b bar`,
        z
          .union([
            z.string().describe(`Blah blah blah string.`),
            z.number().describe(`Blah blah blah number.`),
          ])
          .describe(`Blah blah blah overall.`)
      )
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
  })
  it(`shows default when overall has a default`, () => {
    Command.parameter(
      `b bar`,
      z
        .union([z.string().describe(`Blah blah blah string.`), z.number().describe(`Blah blah blah number.`)])
        .default(1)
        .describe(`Blah blah blah overall.`)
    )
      .settings({ onOutput })
      .parse({
        line: [`-h`],
      })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`shows default as undefined when overall optional`, () => {
    Command.parameter(
      `b bar`,
      z
        .union([z.string().describe(`Blah blah blah string.`), z.number().describe(`Blah blah blah number.`)])
        .optional()
        .describe(`Blah blah blah overall.`)
    )
      .settings({ onOutput })
      .parse({
        line: [`-h`],
      })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
})
