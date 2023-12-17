import { expectTypeOf, test } from 'vitest'
import type { Name } from '../src/_entrypoints/default.js'

// prettier-ignore
test('case', () => {
  expectTypeOf<Name.Parse<'--file-path'>>().toMatchTypeOf<{ long: 'filePath'; short: null; aliases: { short: []; long: [] }}>()
})

// prettier-ignore
test('Some long', () => {
  interface SomeLong {
    long: 'version'
    short: null
    aliases: { short: []; long: [] }
  }

  expectTypeOf<Name.Parse<'--version'>>().toMatchTypeOf<SomeLong>()
  expectTypeOf<Name.Parse<' --version'>>().toMatchTypeOf<SomeLong>()
  expectTypeOf<Name.Parse<'  --version '>>().toMatchTypeOf<SomeLong>()
  expectTypeOf<Name.Parse<'  --version  '>>().toMatchTypeOf<SomeLong>()
  expectTypeOf<Name.Parse<' --version  '>>().toMatchTypeOf<SomeLong>()
  expectTypeOf<Name.Parse<'version  '>>().toMatchTypeOf<SomeLong>()

})

test('Some short', () => {
  interface SomeShort {
    long: null
    short: 'v'
    aliases: { short: []; long: [] }
  }

  expectTypeOf<Name.Parse<'-v'>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<' -v'>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<' -v '>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<' -v  '>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<'  -v '>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<'  -v  '>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<'-v  '>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<'-v '>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<'v '>>().toMatchTypeOf<SomeShort>()
  expectTypeOf<Name.Parse<'v'>>().toMatchTypeOf<SomeShort>()
})

test('Some version', () => {
  interface SomeLongShort {
    long: 'version'
    short: 'v'
    aliases: { short: []; long: [] }
  }

  expectTypeOf<Name.Parse<'--version -v'>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<' --version -v'>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<' --version -v '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  --version -v  '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  --version -v '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'-v --version'>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<' -v --version'>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  -v --version'>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  -v --version '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  -v --version  '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  -v  --version  '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  -v   --version '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'  v   version '>>().toMatchTypeOf<SomeLongShort>()
  expectTypeOf<Name.Parse<'v version'>>().toMatchTypeOf<SomeLongShort>()
})

test('Some long camel case', () => {
  interface SomeLongCamelCase {
    long: 'fooBar'
    short: null
    aliases: { short: []; long: [] }
  }

  expectTypeOf<Name.Parse<'--fooBar'>>().toMatchTypeOf<SomeLongCamelCase>()
  expectTypeOf<Name.Parse<'--foo-bar'>>().toMatchTypeOf<SomeLongCamelCase>()
})
