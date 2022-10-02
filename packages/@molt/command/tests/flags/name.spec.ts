import { Command } from '../../src/index.js'
import type { IsExact } from 'conditional-type-checks'
import { assert } from 'conditional-type-checks'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

describe(`errors`, () => {
  it.todo(`when a flag and an alias of it are given there is an error`, () => {})
  it.todo(`when a long flag and its short flag are given there is an error`, () => {})
})

describe(`string`, () => {
  // prettier-ignore
  it.each([
		[`--ver`, 					[`--ver`, `foo`], 					{ ver: `foo` }],
		[`--ver --version`, [`--ver`, `foo`], 					{ ver: `foo` }],
		[`--ver --version`, [`--version`, `foo`], 			{ ver: `foo` }],
		[`--ver -v`, 				[`--ver`, `foo`], 					{ ver: `foo` }],
		[`--ver -v`,        [`-v`, `foo`], 							{ ver: `foo` }],
		[`-v --ver`,        [`-v`, `foo`], 							{ ver: `foo` }],
		[`-v`,              [`-v`, `foo`], 							{ v:   `foo` }],
	])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
		const args = Command.create({ [spec]: z.string() }).parseOrThrow(input)
		expect(args).toEqual(expectedArgs)
	})
})

describe(`boolean`, () => {
  // prettier-ignore
  it.each([
		[`--ver`, 					[`--ver`], 					  { ver: true }],
		[`--ver --version`, [`--ver`], 					  { ver: true }],
		[`--ver --version`, [`--version`], 			  { ver: true }],
		[`--ver -v`, 				[`--no-ver`], 				{ ver: false }],
		[`--ver`, 					[`--no-ver`], 				{ ver: false }],
		[`--ver --version`, [`--no-ver`], 				{ ver: false }],
		[`--ver --version`, [`--no-version`], 		{ ver: false }],
		[`--ver -v`, 				[`--no-ver`], 				{ ver: false }],
		[`--ver -v`,        [`-v`], 							{ ver: true }],
		[`-v --ver`,        [`-v`], 							{ ver: true }],
		[`-v`,              [`-v`], 							{ v:   true }],
	])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
		const args = Command.create({ [spec]: z.boolean() }).parseOrThrow(input)
		expect(args).toEqual(expectedArgs)
	})
})

describe(`case`, () => {
  describe(`string`, () => {
    // prettier-ignore
    it.each([
      [`--foo-bar`, [`--fooBar`, `foo`], { fooBar: `foo` }],
      [`--foo-bar`, [`--foo-bar`, `foo`], { fooBar: `foo` }],
      [`--fooBar`,  [`--fooBar`, `foo`], { fooBar: `foo` }],
      [`--fooBar`,  [`--foo-bar`, `foo`], { fooBar: `foo` }],
    ])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
      const args = Command.create({ [spec]: z.string() }).parseOrThrow(input)
      expect(args).toEqual(expectedArgs)
    })
  })

  describe(`boolean`, () => {
    // prettier-ignore
    it.each([
      [`--foo-bar`, [`--fooBar`],       { fooBar: true }],
      [`--foo-bar`, [`--foo-bar`],      { fooBar: true }],
      [`--fooBar`,  [`--fooBar`],       { fooBar: true }],
      [`--fooBar`,  [`--foo-bar`],      { fooBar: true }],
      [`--foo-bar`, [`--noFooBar`],     { fooBar: false }],
      [`--foo-bar`, [`--no-foo-bar`],   { fooBar: false }],
      [`--fooBar`,  [`--noFooBar`],     { fooBar: false }],
      [`--fooBar`,  [`--no-foo-bar`],   { fooBar: false }],
    ])(`spec %s + input %s = internal %s`, (spec, input, expectedArgs) => {
      const args = Command.create({ [spec]: z.boolean() }).parseOrThrow(input)
      expect(args).toEqual(expectedArgs)
    })
  })

  it(`kebab case param spec can be passed camel case parameter`, () => {
    const args = Command.create({ '--foo-bar': z.string() }).parseOrThrow([`--fooBar`, `foo`])
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
  it(`kebab case param spec can be passed kebab case parameter`, () => {
    const args = Command.create({ '--foo-bar': z.string() }).parseOrThrow([`--foo-bar`, `foo`])
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
  it(`camel case param spec can be passed kebab case parameter`, () => {
    const args = Command.create({ '--fooBar': z.string() }).parseOrThrow([`--foo-bar`, `foo`])
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
  it(`camel case param spec can be passed camel case parameter`, () => {
    const args = Command.create({ '--fooBar': z.string() }).parseOrThrow([`--fooBar`, `foo`])
    assert<IsExact<{ fooBar: string }, typeof args>>(true)
  })
})
