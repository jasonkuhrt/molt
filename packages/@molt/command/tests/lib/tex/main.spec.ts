import { Tex } from '../../../src/lib/Tex/index.js'
import { describe, expect, it } from 'vitest'

describe(`text`, () => {
  it(`can render text`, () => {
    expect(Tex().text(`foo`).render()).toMatchSnapshot()
  })
})

describe(`block`, () => {
  describe(`width`, () => {
    describe(`%`, () => {
      it(`100%`, () => {
        expect(
          Tex({ maxWidth: 100 })
            .block(`foo bar`)
            .block({ border: { top: `-` }, width: `100%` }, `foo`)
            .render()
        ).toMatchSnapshot()
      })
    })
  })
  it(`can render a line`, () => {
    expect(Tex().block(`foo`).render()).toMatchSnapshot()
  })
  describe(`border`, () => {
    it(`top`, () => {
      expect(
        Tex()
          .block({ border: { top: `-` } }, `foo`)
          .render()
      ).toMatchSnapshot()
    })
    it(`right`, () => {
      expect(
        Tex()
          .block({ border: { right: `|` } }, `foo`)
          .block(($) => {
            return $.set({ border: { right: `|` } })
              .block(`alpha`)
              .block(`bravo bravo`)
              .block(`charlie charlie charlie`)
          })
          .render()
      ).toMatchSnapshot()
    })
    it(`bottom`, () => {
      expect(
        Tex()
          .block({ border: { bottom: `-` } }, `foo`)
          .render()
      ).toMatchSnapshot()
    })
    it(`left`, () => {
      expect(
        Tex()
          .block({ border: { left: `|` } }, `foo`)
          .render()
      ).toMatchSnapshot()
    })
  })

  it(`can render nothing via null`, () => {
    expect(Tex().block(null).render()).toMatchSnapshot()
  })

  it(`can render two lines`, () => {
    expect(Tex().block(`foo`).block(`bar`).render()).toMatchSnapshot()
  })
  describe(`builder`, () => {
    it(`can render a line`, () => {
      expect(
        Tex()
          .block(($) => $.text(`foo`))
          .render()
      ).toMatchSnapshot()
    })
    it(`can render nothing via null`, () => {
      expect(
        Tex()
          .block(() => null)
          .render()
      ).toMatchSnapshot()
    })
  })
  describe(`padding`, () => {
    it(`top`, () => {
      expect(
        Tex()
          .block({ padding: { top: 2 } }, `foo`)
          .render()
      ).toMatchSnapshot()
    })
    it(`bottom`, () => {
      expect(
        Tex()
          .block({ padding: { bottom: 2 } }, `foo`)
          .render()
      ).toMatchSnapshot()
    })
    it(`left`, () => {
      expect(
        Tex()
          .block(($) => $.set({ padding: { left: 2 } }).text(`foo`))
          .render()
      ).toMatchSnapshot()
    })
    it(`left multi line`, () => {
      expect(
        Tex()
          .block(($) =>
            $.set({ padding: { left: 2 } })
              .block(`foo`)
              .block(`bar`)
              .block(`qux`)
          )
          .render()
      ).toMatchSnapshot()
    })
  })
})

describe(`table`, () => {
  it(`can have headers`, () => {
    expect(
      Tex()
        .table(($) => $.headers([`alpha`, `bravo`]))
        .render()
    ).toMatchSnapshot()
  })
})
