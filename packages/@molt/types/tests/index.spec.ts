import { expectType } from 'tsd'
import type { Name } from '../src/index.js'

// eslint-disable-next-line
const as = <T>(): T => 0 as any

// prettier-ignore

namespace _testErrors {
  expectType<Name.Errors.Empty>(as<Name.Parse<''>>())
  expectType<Name.Errors.Empty>(as<Name.Parse<' '>>())

  // Short Flag
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'a'>>>(
    as<Name.Parse<'-a', { reservedNames: 'a'; usedNames: undefined }>>(),
  )
  // Long Flag
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'abc'>>>(
    as<Name.Parse<'--abc', { reservedNames: 'abc'; usedNames: undefined }>>(),
  )
  // Mixing dash prefix style and kebab/camel case does not matter
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
    as<Name.Parse<'--foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
    as<Name.Parse<'--fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
    as<Name.Parse<'foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
    as<Name.Parse<'fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
  )
  // Aliases
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
    as<Name.Parse<'--foo --foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
    as<Name.Parse<'--foo --fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'foo-bar'>>>(
    as<Name.Parse<'foo foo-bar', { reservedNames: 'fooBar'; usedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.Reserved<'fooBar'>>>(
    as<Name.Parse<'foo fooBar', { reservedNames: 'foo-bar'; usedNames: undefined }>>(),
  )

  // Short Flag
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'a'>>>(
    as<Name.Parse<'-a', { usedNames: 'a'; reservedNames: undefined }>>(),
  )
  // Long Flag
  expectType<'Error(s):\nThe name "abc" cannot be used because it is already used for another flag.'>(
    as<Name.Parse<'--abc', { usedNames: 'abc'; reservedNames: undefined }>>(),
  )
  // Mixing dash prefix style and kebab/camel case does not matter
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
    as<Name.Parse<'--fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
    as<Name.Parse<'--foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
    as<Name.Parse<'fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
    as<Name.Parse<'foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
  )
  // Aliases
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
    as<Name.Parse<'--foo --fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
    as<Name.Parse<'--foo --foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'fooBar'>>>(
    as<Name.Parse<'foo fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AlreadyTaken<'foo-bar'>>>(
    as<Name.Parse<'foo foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>(),
  )

  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.LongTooShort<'v'>>>(as<Name.Parse<'--v'>>())
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.LongTooShort<'v'>>>(as<Name.Parse<'--ver --v'>>())
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.ShortTooLong<'vv'>>>(as<Name.Parse<'-vv'>>())

  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'vv'>>>(as<Name.Parse<'--vv --vv'>>())
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'v-v'>>>(
    as<Name.Parse<'--v-v --v-v'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'v'>>>(as<Name.Parse<'-v -v'>>())
  // Mixing dash prefix style and kebab/camel case does not matter
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
    as<Name.Parse<'--fooBar --foo-bar'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
    as<Name.Parse<'--foo-bar --fooBar'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
    as<Name.Parse<'fooBar foo-bar'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
    as<Name.Parse<'foo-bar fooBar'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
    as<Name.Parse<'foo-bar --fooBar'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'fooBar'>>>(
    as<Name.Parse<'--foo-bar fooBar'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
    as<Name.Parse<'fooBar --foo-bar'>>(),
  )
  expectType<Name.Checks.Messages.WithHeader<Name.Checks.Messages.AliasDuplicate<'foo-bar'>>>(
    as<Name.Parse<'--fooBar foo-bar'>>(),
  )
}

// prettier-ignore
namespace _case {
  expectType<{ long: 'filePath'; short: null; aliases: { short: []; long: [] } }>(as<Name.Parse<'--file-path'>>())
}

// prettier-ignore
namespace _mixed {
  expectType<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: []; long: [] } }>(
    as<Name.Parse<'-v'>>(),
  )
  expectType<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: ['x']; long: [] } }>(
    as<Name.Parse<'-v -x'>>(),
  )
  expectType<{ expression: string; canonical: 'v'; long: null; short: 'v'; aliases: { short: ['x', 'y']; long: [] } }>(
    as<Name.Parse<'-v -x -y'>>(),
  )
  expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: null; aliases: { short: []; long: ['xx'] } }>(
    as<Name.Parse<'--vv --xx'>>(),
  )
  expectType<
    { expression: string; canonical: 'vv'; long: 'vv'; short: null; aliases: { short: []; long: ['xx', 'yy'] } }
  >(as<Name.Parse<'--vv --xx --yy'>>())
  expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(
    as<Name.Parse<'-v --vv -x --xx'>>(),
  )
  expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(
    as<Name.Parse<'v vv x xx'>>(),
  )
  expectType<{ expression: string; canonical: 'vv'; long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(
    as<Name.Parse<'v --vv x xx'>>(),
  )
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
