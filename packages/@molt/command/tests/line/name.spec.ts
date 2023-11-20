import { $, b, s } from '../_/helpers.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, test } from 'vitest'

describe(`errors`, () => {
  test.todo(`when a flag and an alias of it are given there is an error`)
  test.todo(`when a long flag and its short flag are given there is an error`)
})

describe(`string`, () => {
  test.each([
    [`--ver`, [`--ver`, `foo`], { ver: `foo` }],
    [`--ver --version`, [`--ver`, `foo`], { ver: `foo` }],
    [`--ver --version`, [`--version`, `foo`], { ver: `foo` }],
    [`--ver -v`, [`--ver`, `foo`], { ver: `foo` }],
    [`--ver -v`, [`-v`, `foo`], { ver: `foo` }],
    [`-v --ver`, [`-v`, `foo`], { ver: `foo` }],
    [`-v`, [`-v`, `foo`], { v: `foo` }],
  ])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
    const args = $.parameter(spec as any, s).parse({ line: input })
    expect(args).toMatchObject(expectedArgs)
  })
})

describe(`boolean`, () => {
  test.each([
    [`--ver`, [`--ver`], { ver: true }],
    [`--ver --version`, [`--ver`], { ver: true }],
    [`--ver --version`, [`--version`], { ver: true }],
    [`--ver -v`, [`--no-ver`], { ver: false }],
    [`--ver`, [`--no-ver`], { ver: false }],
    [`--ver --version`, [`--no-ver`], { ver: false }],
    [`--ver --version`, [`--no-version`], { ver: false }],
    [`--ver -v`, [`--no-ver`], { ver: false }],
    [`--ver -v`, [`-v`], { ver: true }],
    [`-v --ver`, [`-v`], { ver: true }],
    [`-v`, [`-v`], { v: true }],
  ])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
    const args = $.parameter(spec as any, b).parse({ line: input })
    expect(args).toMatchObject(expectedArgs)
  })
})

describe(`stacked short flags`, () => {
  test.each([
    [[`-abc`], { a: true, b: true, c: true }],
    [[`-ac`], { a: true, b: false, c: true }],
    [[`-abcd`, `foo`], { a: true, b: true, c: true, d: `foo` }],
  ])(`stacked short flag input of %s becomes %s`, (input, expectedArgs) => {
    const args = $.parameter(`a`, b.default(false))
      .parameter(`b`, b.default(false))
      .parameter(`c`, b.default(false))
      .parameter(`d`, s.optional())
      .parse({ line: input })
    expect(args).toMatchObject(expectedArgs)
  })
})

describe(`separator`, () => {
  test.each([
    [[`--foo=bar`], { foo: `bar` }],
    [[`--foo`, `=`, `bar`], { foo: `bar` }],
    [[`--foo= `, `bar`], { foo: `bar` }],
    [[`--foo`, `=bar`], { foo: `=bar` }],
  ])(`spec %s becomes %s`, (input, expectedArgs) => {
    const args = $.parameter(`foo`, s).parse({ line: input })
    expect(args).toMatchObject(expectedArgs)
  })
})

describe(`case`, () => {
  describe(`string`, () => {
    test.each([
      [`--foo-bar`, [`--fooBar`, `foo`], { fooBar: `foo` }],
      [`--foo-bar`, [`--foo-bar`, `foo`], { fooBar: `foo` }],
      [`--fooBar`, [`--fooBar`, `foo`], { fooBar: `foo` }],
      [`--fooBar`, [`--foo-bar`, `foo`], { fooBar: `foo` }],
    ])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
      const args = $.parameter(spec as any, s).parse({ line: input })
      expect(args).toMatchObject(expectedArgs)
    })
  })

  describe(`boolean`, () => {
    test.each([
      [`--foo-bar`, [`--fooBar`], { fooBar: true }],
      [`--foo-bar`, [`--foo-bar`], { fooBar: true }],
      [`--fooBar`, [`--fooBar`], { fooBar: true }],
      [`--fooBar`, [`--foo-bar`], { fooBar: true }],
      [`--foo-bar`, [`--noFooBar`], { fooBar: false }],
      [`--foo-bar`, [`--no-foo-bar`], { fooBar: false }],
      [`--fooBar`, [`--noFooBar`], { fooBar: false }],
      [`--fooBar`, [`--no-foo-bar`], { fooBar: false }],
    ])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
      const args = $.parameter(spec as any, b).parse({ line: input })
      expect(args).toMatchObject(expectedArgs)
    })
  })

  test(`kebab case param spec can be passed camel case parameter`, () => {
    const args = $.parameter(`--foo-bar`, s).parse({ line: [`--fooBar`, `foo`] })
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
  test(`kebab case param spec can be passed kebab case parameter`, () => {
    const args = $.parameter(`--foo-bar`, s).parse({ line: [`--foo-bar`, `foo`] })
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
  test(`camel case param spec can be passed kebab case parameter`, () => {
    const args = $.parameter(`--fooBar`, s).parse({ line: [`--foo-bar`, `foo`] })
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
  test(`camel case param spec can be passed camel case parameter`, () => {
    const args = $.parameter(`--fooBar`, s).parse({ line: [`--fooBar`, `foo`] })
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
})
