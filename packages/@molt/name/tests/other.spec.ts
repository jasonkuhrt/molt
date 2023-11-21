import { expectType } from 'tsd'
import type { Name } from '../src/_entrypoints/default.js'
import { as } from './_/helpers.js'

namespace _case {
  expectType<{ long: 'filePath'; short: null; aliases: { short: []; long: [] } }>(as<Name.Parse<'--file-path'>>())
}

interface SomeLong {
  long: 'version'
  short: null
  aliases: { short: []; long: [] }
}

expectType<SomeLong>(as<Name.Parse<'--version'>>())
expectType<SomeLong>(as<Name.Parse<' --version'>>())
expectType<SomeLong>(as<Name.Parse<'  --version '>>())
expectType<SomeLong>(as<Name.Parse<'  --version  '>>())
expectType<SomeLong>(as<Name.Parse<' --version  '>>())
expectType<SomeLong>(as<Name.Parse<'version  '>>())

interface SomeShort {
  long: null
  short: 'v'
  aliases: { short: []; long: [] }
}

expectType<SomeShort>(as<Name.Parse<'-v'>>())
expectType<SomeShort>(as<Name.Parse<' -v'>>())
expectType<SomeShort>(as<Name.Parse<' -v '>>())
expectType<SomeShort>(as<Name.Parse<' -v  '>>())
expectType<SomeShort>(as<Name.Parse<'  -v '>>())
expectType<SomeShort>(as<Name.Parse<'  -v  '>>())
expectType<SomeShort>(as<Name.Parse<'-v  '>>())
expectType<SomeShort>(as<Name.Parse<'-v '>>())
expectType<SomeShort>(as<Name.Parse<'v '>>())
expectType<SomeShort>(as<Name.Parse<'v'>>())

interface SomeLongShort {
  long: 'version'
  short: 'v'
  aliases: { short: []; long: [] }
}

expectType<SomeLongShort>(as<Name.Parse<'--version -v'>>())
expectType<SomeLongShort>(as<Name.Parse<' --version -v'>>())
expectType<SomeLongShort>(as<Name.Parse<' --version -v '>>())
expectType<SomeLongShort>(as<Name.Parse<'  --version -v  '>>())
expectType<SomeLongShort>(as<Name.Parse<'  --version -v '>>())
expectType<SomeLongShort>(as<Name.Parse<'-v --version'>>())
expectType<SomeLongShort>(as<Name.Parse<' -v --version'>>())
expectType<SomeLongShort>(as<Name.Parse<'  -v --version'>>())
expectType<SomeLongShort>(as<Name.Parse<'  -v --version '>>())
expectType<SomeLongShort>(as<Name.Parse<'  -v --version  '>>())
expectType<SomeLongShort>(as<Name.Parse<'  -v  --version  '>>())
expectType<SomeLongShort>(as<Name.Parse<'  -v   --version '>>())
expectType<SomeLongShort>(as<Name.Parse<'  v   version '>>())
expectType<SomeLongShort>(as<Name.Parse<'v version'>>())

interface SomeLongCamelCase {
  long: 'fooBar'
  short: null
  aliases: { short: []; long: [] }
}

expectType<SomeLongCamelCase>(as<Name.Parse<'--fooBar'>>())
expectType<SomeLongCamelCase>(as<Name.Parse<'--foo-bar'>>())
