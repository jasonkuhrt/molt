import { Tex } from '../../../src/lib/Tex/index.js'
import { describe, expect, it } from 'vitest'

describe(`text`, () => {
  $(`can render text`, Tex.Tex().text(`foo`))
})

describe(`block`, () => {
  describe(`width`, () => {
    describe(`%`, () => {
      $(
        `100%`,
        Tex.Tex({ maxWidth: 100 })
          .block(`foo bar`)
          .block({ border: { top: `-` }, width: `100%` }, `foo`)
      )
    })
  })
  $(`can render a line`, Tex.Tex().block(`foo`))
  describe(`border`, () => {
    $(`top`, Tex.Tex().block({ border: { top: `-` } }, `foo`))
    $(
      `right`,
      Tex.Tex()
        .block({ border: { right: `|` } }, `foo`)
        .block(($) =>
          $.set({ border: { right: `|` } })
            .block(`alpha`)
            .block(`bravo bravo`)
            .block(`charlie charlie charlie`)
        )
    )
    $(`bottom`, Tex.Tex().block({ border: { bottom: `-` } }, `foo`))
    $(`left`, Tex.Tex().block({ border: { left: `|` } }, `foo`))
  })

  $(`can render nothing via null`, Tex.Tex().block(null))

  $(`can render two lines`, Tex.Tex().block(`foo`).block(`bar`))
  describe(`builder`, () => {
    $(
      `can render a line`,
      Tex.Tex().block(($) => $.text(`foo`))
    )
    $(
      `can render nothing via null`,
      Tex.Tex().block(() => null)
    )
  })
  describe(`padding`, () => {
    $(`top`, Tex.Tex().block({ padding: { top: 2 } }, `foo`))
    $(`bottom`, Tex.Tex().block({ padding: { bottom: 2 } }, `foo`))
    $(
      `left`,
      Tex.Tex().block(($) => $.set({ padding: { left: 2 } }).text(`foo`))
    )
    $(
      `left multi line`,
      Tex.Tex().block(($) =>
        $.set({ padding: { left: 2 } })
          .block(`foo`)
          .block(`bar`)
          .block(`qux`)
      )
    )
  })
})

describe(`list`, () => {
  $(`can render items`, Tex.Tex().list([`foo`, `bar`]))
  $(`can render multi-line items`, Tex.Tex().list([`foo`, `bar\nbaz\nqux`, `zod`]))
  $(`can have custom bullet`, Tex.Tex().list({ bullet: { graphic: `-` } }, [`foo`, `zod`]))
  $(
    `can have custom bullet function`,
    Tex.Tex().list({ bullet: { graphic: (i) => `(${i})` } }, [`foo`, `zod`])
  )
  $(
    `the gutter of bullets is left aligned by default`,
    Tex.Tex().list({ bullet: { graphic: (i) => String(i) } }, `abcdefghijklmnopqrstuvwxyz`.split(``))
  )
  $(
    `the gutter of bullets can be right aligned`,
    Tex.Tex().list(
      { bullet: { graphic: (i) => String(i), align: { horizontal: `right` } } },
      `abcdefghijklmnopqrstuvwxyz`.split(``)
    )
  )
})

describe(`table`, () => {
  $(
    `can have headers`,
    Tex.Tex().table(($) => $.headers([`alpha`, `bravo`]))
  )
  $(
    `can have a row`,
    Tex.Tex().table(($) => $.headers([`alpha`, `bravo`]).row(`a`, `b`))
  )
  $(
    `if a row has columns exceeding the headers they render with empty header cells`,
    Tex.Tex().table(($) => $.headers([`alpha`, `bravo`]).row(`a`, `b`, `c`))
  )
  $(
    `if headers have columns exceeding the given data they are rendered with empty column cells`,
    Tex.Tex().table(($) => $.headers([`alpha`, `bravo`, `charlie`]).row(`a`, `b`))
  )
  $(
    `data column width equals widest cell`,
    Tex.Tex().table(($) =>
      $.headers([`alpha`, `bravo`, `charlieeeeeeeeeeeeeeeeeee`, `delta`])
        .row(`a1`, `b1`, `c1`, `d1`)
        .row(`a222222222222222`, `b2`, `c2`, `d2`)
        .row(`a3`, `b333333333333333333`, `c3`, `d3`)
    )
  )
  $(
    `data column width equals widest cell (multi-line)`,
    Tex.Tex().table(($) =>
      $.headers([`alpha`, `bravo`, `charlieeeeeeeeeeeeeeeeeee`, `delta`])
        .row(`a1`, `b1`, `c1`, `d1`)
        .row(`a222222222222222\na2`, `b2`, `c2`, `d2`)
        .row(`a3`, `b333333333333333333`, `c3`, `d3`)
    )
  )
  $(
    `cell text is vertically aligned top`,
    Tex.Tex().table(($) => $.row(`alpha\napple\nankle`, `beta\nbanana`))
  )
  describe(`set`, () => {
    $(
      `custom row separator`,
      Tex.Tex().table(($) =>
        $.set({ separators: { row: ` ` } })
          .headers([`alpha`, `bravo`, `charlie`])
          .row(`a`, `b`)
      )
    )
    $(
      `custom vertical separator`,
      Tex.Tex().table(($) =>
        $.set({ separators: { column: ` ` } })
          .headers([`alpha`, `bravo`, `charlie`])
          .row(`a`, `b`)
      )
    )
  })
})

const $ = (description: string, value: Tex.RootBuilder) => {
  it(description, () => {
    expect(value.render()).toMatchSnapshot()
  })
}

$.only = (description: string, value: Tex.RootBuilder) => {
  it.only(description, () => {
    expect(value.render()).toMatchSnapshot()
  })
}
