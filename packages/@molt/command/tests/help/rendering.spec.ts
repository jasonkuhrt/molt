import stripAnsi from 'strip-ansi'
import { describe, expect, it } from 'vitest'
import { mockProcessExit } from 'vitest-mock-process'
import { $, n, ps, s } from '../_/helpers.js'
import { createState } from '../environment/__helpers__.js'
import { p, t } from '../../src/_entrypoints/default.js'
import { z } from 'zod'

mockProcessExit()

const output = createState<string>({
  value: (values) => values.join(``),
})

const onOutput = output.set

it(`if command has description it is shown`, () => {
  $.description(`Blah blah blah`)
    .parameter(`foo`, ps.optional())
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if there is optional param it is shown`, () => {
  $.parameter(`a`, ps.optional())
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if parameter has description it is shown`, () => {
  $.parameter(`a`, ps.optional().description(`Blah blah blah.`))
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`long description wraps within column`, () => {
  $.parameter(
    `a`,
    ps
      .optional()
      .description(`Blah blah blah. Blah blah blah. Blah blah blah.`),
  )
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if parameter has default it is shown`, () => {
  $.parameter(`foo`, ps.default(`bar`))
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if parameter is optional without default then its default shows up as "undefined"`, () => {
  $.parameter(`foo`, ps.optional())
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  $.parameter(
    `foo`,
    ps.default(() => {
      throw new Error(`whoops`)
    }),
  )
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`if there is an error trying to get default then a nice message is shown`, () => {
  $.parameter(
    `foo`,
    ps.default(() => {
      throw new Error(`whoops`)
    }),
  )
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

it(`enums do not mess up alignment when they are widest line in the column`, () => {
  $.parameter(
    `foo`,
    t.enumeration([
      `a`,
      `b`,
      `c`,
      `d`,
      `e`,
      `f`,
      `g`,
      `h`,
      `i`,
      `j`,
      `k`,
      `l`,
      `m`,
      `n`,
      `o`,
      `p`,
      `q`,
      `r`,
      `s`,
      `t`,
      `u`,
      `v`,
      `w`,
      `x`,
      `y`,
      `z`,
    ]),
  )
    .parameter(`bar`, ps.optional())
    .settings({ onOutput })
    .parse({ line: [`-h`] })
  expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
  expect(output.value).toMatchSnapshot(`polychrome`)
})

describe(`enum`, () => {
  it(`enum members are listed`, () => {
    $.parameter(`foo`, t.enumeration([`apple`, `dolphin`, `cab`]))
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })

  it(`optional enum members are listed`, () => {
    $.parameter(
      `foo`,
      p.type(t.enumeration([`apple`, `dolphin`, `cab`])).optional(),
    )
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })

  it(`when there is only one enum member it is prefixed with "enum:" to avoid confusion of it looking like the name of a kind of type`, () => {
    $.parameter(`foo`, t.enumeration([`apple`]))
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })

  it(`when there are many members they wrap`, () => {
    $.parameter(
      `foo`,
      t.enumeration([
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
    )
      .settings({ onOutput })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
})

describe(`environment`, () => {
  it(`when environment is disabled then environment doc is not shown`, () => {
    $.parameter(`foo`, s)
      .settings({ onOutput, parameters: { environment: false } })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is enabled it shows as the last column`, () => {
    $.parameter(`foo`, s)
      .settings({ onOutput, parameters: { environment: true } })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment is disabled for one parameter it has X indicating that`, () => {
    $.parameter(`foo`, s)
      .parameter(`bar`, s)
      .settings({
        onOutput,
        parameters: { environment: { $default: true, foo: false } },
      })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has custom prefix it is displayed`, () => {
    $.parameter(`foo`, s)
      .parameter(`bar`, s)
      .settings({
        onOutput,
        parameters: { environment: { $default: true, foo: { prefix: `moo` } } },
      })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has multiple custom prefix they are displayed`, () => {
    $.parameter(`foo`, s)
      .parameter(`bar`, s)
      .settings({
        onOutput,
        parameters: {
          environment: { $default: true, foo: { prefix: [`moo`, `boo`] } },
        },
      })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`when environment has no prefix it is displayed`, () => {
    $.parameter(`foo`, s)
      .parameter(`bar`, s)
      .settings({
        onOutput,
        parameters: { environment: { $default: true, foo: { prefix: false } } },
      })
      .parse({ line: [`-h`] })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
})

describe(`exclusive`, () => {
  describe(`optional`, () => {
    it(`shows exclusive parameters as a group`, () => {
      $.parametersExclusive(`foo`, (_) =>
        _.parameter(`b bar`, s).parameter(`z baz`, s).optional(),
      )
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
      $.parametersExclusive(`foo`, (_) =>
        _.parameter(`b bar`, s)
          .parameter(`z baz`, s)
          .default(`bar`, `bar_default`),
      )
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
  })
  describe(`default with long value`, () => {
    it(`shows the group default`, () => {
      $.parametersExclusive(`foo`, (_) =>
        _.parameter(`b bar`, s)
          .parameter(`z baz`, s)
          .default(`bar`, `bar_defaulttttttttttttttttttttt`),
      )
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
  })
  describe(`with environment disabled`, () => {
    it(`shows the group default`, () => {
      $.parametersExclusive(`foo`, (_) =>
        _.parameter(`b bar`, s)
          .parameter(`z baz`, s)
          .default(`bar`, `bar_default`),
      )
        .settings({ onOutput, parameters: { environment: false } })
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
      $.parameter(`b bar`, t.union([t.string(), t.number()]))
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
    it(`used when only overall description given`, () => {
      $.parameter(
        `b bar`,
        t.union([t.string(), t.number()]).description(`Blah blah blah.`),
      )
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
  })
  describe(`expanded style`, () => {
    it(`can be forced via settings`, () => {
      $.parameter(`b bar`, t.union([s, n]))
        .settings({
          onOutput,
          helpRendering: { union: { mode: `expandAlways` } },
        })
        .parse({ line: [`-h`] })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
    it(`shows member on each line if each has description`, () => {
      $.parameter(
        `b bar`,
        t.union([
          s.description(`Blah blah blah string.`),
          z.description(`Blah blah blah number.`),
        ]),
      )
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
    it(`shows member on each line if at least one has description`, () => {
      $.parameter(`bar`, t.union([s, n.description(`Blah blah blah number.`)]))
        .settings({ onOutput })
        .parse({
          line: [`-h`],
        })
      expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
      expect(output.value).toMatchSnapshot(`polychrome`)
    })
    it(`shows overall description above all members when members also have descriptions`, () => {
      $.parameter(
        `b bar`,
        t
          .union([
            s.description(`Blah blah blah string.`),
            n.description(`Blah blah blah number.`),
          ])
          .description(`Blah blah blah overall.`),
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
    $.parameter(
      `b bar`,
      t
        .union([
          s.description(`Blah blah blah string.`),
          n.description(`Blah blah blah number.`),
        ])
        .default(1)
        .description(`Blah blah blah overall.`),
    )
      .settings({ onOutput })
      .parse({
        line: [`-h`],
      })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
  it(`shows default as undefined when overall optional`, () => {
    $.parameter(
      `b bar`,
      t
        .union([
          s.description(`Blah blah blah string.`),
          n.description(`Blah blah blah number.`),
        ])
        .optional()
        .description(`Blah blah blah overall.`),
    )
      .settings({ onOutput })
      .parse({
        line: [`-h`],
      })
    expect(stripAnsi(output.value)).toMatchSnapshot(`monochrome`)
    expect(output.value).toMatchSnapshot(`polychrome`)
  })
})
