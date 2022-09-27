import type { FlagName } from '../src/index.js'
import { expectType } from 'tsd'

// eslint-disable-next-line
const as = <T>(): T => 0 as any

// prettier-ignore

namespace _testErrors {
	expectType<FlagName.Errors.Empty>(as<											FlagName.Parse<''>>())
	expectType<FlagName.Errors.Empty>(as<											FlagName.Parse<' '>>())

	// Short Flag
	expectType<FlagName.Errors.NameReserved<'a'>>(as<					FlagName.Parse<'-a', { reservedNames: 'a'; usedNames: undefined }>>())
	// Long Flag
	expectType<FlagName.Errors.NameReserved<'abc'>>(as<				FlagName.Parse<'--abc', { reservedNames: 'abc'; usedNames: undefined }>>())
		// Mixing dash prefix style and kebab/camel case does not matter
		expectType<FlagName.Errors.NameReserved<'foo-bar'>>(as<		FlagName.Parse<'--foo-bar', { reservedNames: 'fooBar';  usedNames: undefined }>>())
		expectType<FlagName.Errors.NameReserved<'fooBar'>>(as<		FlagName.Parse<'--fooBar',  { reservedNames: 'foo-bar'; usedNames: undefined }>>())
		expectType<FlagName.Errors.NameReserved<'foo-bar'>>(as<		FlagName.Parse<'foo-bar',   { reservedNames: 'fooBar';  usedNames: undefined }>>())
		expectType<FlagName.Errors.NameReserved<'fooBar'>>(as<		FlagName.Parse<'fooBar',    { reservedNames: 'foo-bar'; usedNames: undefined }>>())
			// Aliases
			expectType<FlagName.Errors.NameReserved<'foo-bar'>>(as<		FlagName.Parse<'--foo --foo-bar', { reservedNames: 'fooBar';  usedNames: undefined }>>())
			expectType<FlagName.Errors.NameReserved<'fooBar'>>(as<		FlagName.Parse<'--foo --fooBar',  { reservedNames: 'foo-bar'; usedNames: undefined }>>())
			expectType<FlagName.Errors.NameReserved<'foo-bar'>>(as<		FlagName.Parse<'foo foo-bar',   { reservedNames: 'fooBar';  usedNames: undefined }>>())
			expectType<FlagName.Errors.NameReserved<'fooBar'>>(as<		FlagName.Parse<'foo fooBar',    { reservedNames: 'foo-bar'; usedNames: undefined }>>())

	// Short Flag
	expectType<FlagName.Errors.NameAlreadyTaken<'a'>>(as<			FlagName.Parse<'-a', { usedNames: 'a'; reservedNames: undefined }>>())
	// Long Flag
		expectType<FlagName.Errors.NameAlreadyTaken<'abc'>>(as<		FlagName.Parse<'--abc', { usedNames: 'abc'; reservedNames: undefined }>>())
		// Mixing dash prefix style and kebab/camel case does not matter
		expectType<FlagName.Errors.NameAlreadyTaken<'fooBar'>>(as<FlagName.Parse<'--fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
		expectType<FlagName.Errors.NameAlreadyTaken<'foo-bar'>>(as<FlagName.Parse<'--foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())
		expectType<FlagName.Errors.NameAlreadyTaken<'fooBar'>>(as<FlagName.Parse<'fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
		expectType<FlagName.Errors.NameAlreadyTaken<'foo-bar'>>(as<FlagName.Parse<'foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())
			// Aliases
			expectType<FlagName.Errors.NameAlreadyTaken<'fooBar'>>(as<FlagName.Parse<'--foo --fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
			expectType<FlagName.Errors.NameAlreadyTaken<'foo-bar'>>(as<FlagName.Parse<'--foo --foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())
			expectType<FlagName.Errors.NameAlreadyTaken<'fooBar'>>(as<FlagName.Parse<'foo fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
			expectType<FlagName.Errors.NameAlreadyTaken<'foo-bar'>>(as<FlagName.Parse<'foo foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())

	expectType<FlagName.Errors.LongFlagTooShort<'v'>>(as<			FlagName.Parse<'--v'>>())
	expectType<FlagName.Errors.LongFlagTooShort<'v'>>(as<			FlagName.Parse<'--ver --v'>>())
	expectType<FlagName.Errors.ShortFlagTooLong<'vv'>>(as<		FlagName.Parse<'-vv'>>())

	expectType<FlagName.Errors.AliasDuplicate<'vv'>>(as<			FlagName.Parse<'--vv --vv'>>())
	expectType<FlagName.Errors.AliasDuplicate<'v-v'>>(as<			FlagName.Parse<'--v-v --v-v'>>())
	expectType<FlagName.Errors.AliasDuplicate<'v'>>(as<				FlagName.Parse<'-v -v'>>())
		// Mixing dash prefix style and kebab/camel case does not matter
		expectType<FlagName.Errors.AliasDuplicate<'foo-bar'>>(as<	FlagName.Parse<'--fooBar --foo-bar'>>())
		expectType<FlagName.Errors.AliasDuplicate<'fooBar'>>(as<	FlagName.Parse<'--foo-bar --fooBar'>>())
		expectType<FlagName.Errors.AliasDuplicate<'foo-bar'>>(as<	FlagName.Parse<'fooBar foo-bar'>>())
		expectType<FlagName.Errors.AliasDuplicate<'fooBar'>>(as<	FlagName.Parse<'foo-bar fooBar'>>())
		expectType<FlagName.Errors.AliasDuplicate<'fooBar'>>(as<	FlagName.Parse<'foo-bar --fooBar'>>())
		expectType<FlagName.Errors.AliasDuplicate<'fooBar'>>(as<	FlagName.Parse<'--foo-bar fooBar'>>())
		expectType<FlagName.Errors.AliasDuplicate<'foo-bar'>>(as<	FlagName.Parse<'fooBar --foo-bar'>>())
		expectType<FlagName.Errors.AliasDuplicate<'foo-bar'>>(as<	FlagName.Parse<'--fooBar foo-bar'>>())
}

//prettier-ignore
namespace _case {
	expectType<{ long: 'filePath'; short: undefined; aliases: { short: []; long: [] } }>(as<FlagName.Parse<'--file-path'>>())
}

//prettier-ignore
namespace _mixed {
	expectType<{ long: undefined; short: 'v'; aliases: { short: []; long: [] } }>(as<							FlagName.Parse<'-v'>>())
	expectType<{ long: undefined; short: 'v'; aliases: { short: ['x']; long: [] } }>(as<					FlagName.Parse<'-v -x'>>())
	expectType<{ long: undefined; short: 'v'; aliases: { short: ['x', 'y']; long: [] } }>(as<			FlagName.Parse<'-v -x -y'>>())
	expectType<{ long: 'vv'; short: undefined; aliases: { short: []; long: ['xx'] } }>(as<				FlagName.Parse<'--vv --xx'>>())
	expectType<{ long: 'vv'; short: undefined; aliases: { short: []; long: ['xx', 'yy'] } }>(as<	FlagName.Parse<'--vv --xx --yy'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						FlagName.Parse<'-v --vv -x --xx'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						FlagName.Parse<'v vv x xx'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						FlagName.Parse<'v --vv x xx'>>())
}

interface SomeLong {
  long: 'version'
  short: undefined
  aliases: { short: []; long: [] }
}

expectType<SomeLong>(as<FlagName.Parse<'--version'>>())
expectType<SomeLong>(as<FlagName.Parse<' --version'>>())
expectType<SomeLong>(as<FlagName.Parse<'  --version '>>())
expectType<SomeLong>(as<FlagName.Parse<'  --version  '>>())
expectType<SomeLong>(as<FlagName.Parse<' --version  '>>())
expectType<SomeLong>(as<FlagName.Parse<'version  '>>())

interface SomeShort {
  long: undefined
  short: 'v'
  aliases: { short: []; long: [] }
}

expectType<SomeShort>(as<FlagName.Parse<'-v'>>())
expectType<SomeShort>(as<FlagName.Parse<' -v'>>())
expectType<SomeShort>(as<FlagName.Parse<' -v '>>())
expectType<SomeShort>(as<FlagName.Parse<' -v  '>>())
expectType<SomeShort>(as<FlagName.Parse<'  -v '>>())
expectType<SomeShort>(as<FlagName.Parse<'  -v  '>>())
expectType<SomeShort>(as<FlagName.Parse<'-v  '>>())
expectType<SomeShort>(as<FlagName.Parse<'-v '>>())
expectType<SomeShort>(as<FlagName.Parse<'v '>>())
expectType<SomeShort>(as<FlagName.Parse<'v'>>())

interface SomeLongShort {
  long: 'version'
  short: 'v'
  aliases: { short: []; long: [] }
}

expectType<SomeLongShort>(as<FlagName.Parse<'--version -v'>>())
expectType<SomeLongShort>(as<FlagName.Parse<' --version -v'>>())
expectType<SomeLongShort>(as<FlagName.Parse<' --version -v '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  --version -v  '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  --version -v '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'-v --version'>>())
expectType<SomeLongShort>(as<FlagName.Parse<' -v --version'>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  -v --version'>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  -v --version '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  -v --version  '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  -v  --version  '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  -v   --version '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'  v   version '>>())
expectType<SomeLongShort>(as<FlagName.Parse<'v version'>>())

interface SomeLongCamelCase {
  long: 'fooBar'
  short: undefined
  aliases: { short: []; long: [] }
}

expectType<SomeLongCamelCase>(as<FlagName.Parse<'--fooBar'>>())
expectType<SomeLongCamelCase>(as<FlagName.Parse<'--foo-bar'>>())
