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
    $(`top-left`, Tex.Tex().block({ border: { left: `|`, top: `-` } }, `abc`))
    $(`top-right`, Tex.Tex().block({ border: { right: `|`, top: `-` } }, `abc`))
    $(`bottom-left`, Tex.Tex().block({ border: { left: `|`, bottom: `-` } }, `abc`))
    $(`bottom-right`, Tex.Tex().block({ border: { right: `|`, bottom: `-` } }, `abc`))
    $(`all`, Tex.Tex().block({ border: { right: `|`, left: `|`, top: `-`, bottom: `-` } }, `abc`))
    $(
      `all-nested`,
      Tex.Tex().block(($) =>
        $.set({ border: { right: `|`, left: `|`, top: `-`, bottom: `-` } }).block(
          { border: { right: `|`, left: `|`, top: `-`, bottom: `-` } },
          `abc`
        )
      )
    )
    describe(`corners`, () => {
      $(`top`, Tex.Tex().block({ border: { corners: `o`, bottom: `-` } }, `foo`))
      $(`right`, Tex.Tex().block({ border: { corners: `o`, right: `|` } }, `foo`))
      $(`bottom`, Tex.Tex().block({ border: { corners: `o`, bottom: `-` } }, `foo`))
      $(`left`, Tex.Tex().block({ border: { corners: `o`, left: `|` } }, `foo`))
      $(
        `all`,
        Tex.Tex().block({ border: { corners: `o`, top: `-`, right: `|`, bottom: `-`, left: `|` } }, `foo`)
      )
      $(
        `all-nested`,
        Tex.Tex().block(($) =>
          $.set({ border: { corners: `o`, right: `|`, left: `|`, top: `-`, bottom: `-` } }).block(
            { border: { corners: `o`, right: `|`, left: `|`, top: `-`, bottom: `-` } },
            `abc`
          )
        )
      )
    })
  })
  describe(`set`, () => {
    it(`can be at method or builder level`, () => {
      const a = Tex.Tex()
        .block(($) =>
          $.set({ border: { corners: `o`, right: `|`, left: `|`, top: `-`, bottom: `-` } }).block(
            { border: { corners: `o`, right: `|`, left: `|`, top: `-`, bottom: `-` } },
            `abc`
          )
        )
        .render()
      const b = Tex.Tex()
        .block({ border: { corners: `o`, right: `|`, left: `|`, top: `-`, bottom: `-` } }, ($) =>
          $.block({ border: { corners: `o`, right: `|`, left: `|`, top: `-`, bottom: `-` } }, `abc`)
        )
        .render()
      expect(a).toEqual(b)
    })
  })
})

describe(`list`, () => {
  $(`can render items`, Tex.Tex().list([`foo`, `bar`]))
  it(`null items are ignored`, () => {
    expect(Tex.Tex().list([`foo`, null, `bar`]).render()).toEqual(Tex.Tex().list([`foo`, `bar`]).render())
  })
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
  describe(`headers`, () => {
    $(
      `can be passed as an array`,
      Tex.Tex().table(($) => $.headers([`alpha`, `bravo`]))
    )
    $(
      `if exceed column count of the actual given data they are rendered with empty column cells`,
      Tex.Tex().table(($) => $.headers([`alpha`, `bravo`, `charlie`]).row(`a`, `b`))
    )
    $(
      `can be a block`,
      Tex.Tex().block(($) =>
        $.table(($) =>
          $.header(new Tex.Block({ padding: { right: 10 } }, `alpha`))
            .header(new Tex.Block({ border: { bottom: `~` } }, `bravo`))
            .row(`a`, `b`)
        )
      )
    )
  })

  describe(`row`, () => {
    $(
      `can have a row`,
      Tex.Tex().table(($) => $.headers([`alpha`, `bravo`]).row(`a`, `b`))
    )
    $(
      `if a row has columns exceeding the headers they render with empty header cells`,
      Tex.Tex().table(($) => $.headers([`alpha`, `bravo`]).row(`a`, `b`, `c`))
    )
    $(
      `null is not rendered`,
      Tex.Tex().table(($) => $.row(`a1`, `b1`).row(null).row(`a3`, `b3`))
    )
    $(
      `null cell is not rendered`,
      Tex.Tex().table(($) => $.row(`a1`, `b1`).row(`a2`, null, `c2`))
    )
  })
  describe(`rows`, () => {
    $(
      `pure null rows are not rendered`,
      Tex.Tex().table(($) => $.rows([`a1`, `b1`]).rows(null).rows([`a3`, `b3`]))
    )
    $(
      `null rows are not rendered`,
      Tex.Tex().table(($) => $.rows([`a1`, `b1`], null, [`a3`, `b3`]))
    )
  })

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

const $ = (description: string, builder: Tex.Builder | null) => {
  it(description, () => {
    expect(builder && Tex.render(builder)).toMatchSnapshot()
  })
}

$.only = (description: string, builder: Tex.Builder | null) => {
  it.only(description, () => {
    expect(builder && Tex.render(builder)).toMatchSnapshot()
  })
}
