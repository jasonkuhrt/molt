import type { Name } from '../src/index.js'
import { expectType } from 'tsd'

// eslint-disable-next-line
const as = <T>(): T => 0 as any

// prettier-ignore

namespace _testErrors {
	expectType<Name.Errors.Empty>(as<											Name.Parse<''>>())
	expectType<Name.Errors.Empty>(as<											Name.Parse<' '>>())

	// Short Flag
	expectType<Name.Errors.Reserved<'a'>>(as<					Name.Parse<'-a', { reservedNames: 'a'; usedNames: undefined }>>())
	// Long Flag
	expectType<Name.Errors.Reserved<'abc'>>(as<				Name.Parse<'--abc', { reservedNames: 'abc'; usedNames: undefined }>>())
		// Mixing dash prefix style and kebab/camel case does not matter
		expectType<Name.Errors.Reserved<'foo-bar'>>(as<		Name.Parse<'--foo-bar', { reservedNames: 'fooBar';  usedNames: undefined }>>())
		expectType<Name.Errors.Reserved<'fooBar'>>(as<		Name.Parse<'--fooBar',  { reservedNames: 'foo-bar'; usedNames: undefined }>>())
		expectType<Name.Errors.Reserved<'foo-bar'>>(as<		Name.Parse<'foo-bar',   { reservedNames: 'fooBar';  usedNames: undefined }>>())
		expectType<Name.Errors.Reserved<'fooBar'>>(as<		Name.Parse<'fooBar',    { reservedNames: 'foo-bar'; usedNames: undefined }>>())
			// Aliases
			expectType<Name.Errors.Reserved<'foo-bar'>>(as<		Name.Parse<'--foo --foo-bar', { reservedNames: 'fooBar';  usedNames: undefined }>>())
			expectType<Name.Errors.Reserved<'fooBar'>>(as<		Name.Parse<'--foo --fooBar',  { reservedNames: 'foo-bar'; usedNames: undefined }>>())
			expectType<Name.Errors.Reserved<'foo-bar'>>(as<		Name.Parse<'foo foo-bar',   { reservedNames: 'fooBar';  usedNames: undefined }>>())
			expectType<Name.Errors.Reserved<'fooBar'>>(as<		Name.Parse<'foo fooBar',    { reservedNames: 'foo-bar'; usedNames: undefined }>>())

	// Short Flag
	expectType<Name.Errors.AlreadyTaken<'a'>>(as<			Name.Parse<'-a', { usedNames: 'a'; reservedNames: undefined }>>())
	// Long Flag
		expectType<Name.Errors.AlreadyTaken<'abc'>>(as<		Name.Parse<'--abc', { usedNames: 'abc'; reservedNames: undefined }>>())
		// Mixing dash prefix style and kebab/camel case does not matter
		expectType<Name.Errors.AlreadyTaken<'fooBar'>>(as<Name.Parse<'--fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
		expectType<Name.Errors.AlreadyTaken<'foo-bar'>>(as<Name.Parse<'--foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())
		expectType<Name.Errors.AlreadyTaken<'fooBar'>>(as<Name.Parse<'fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
		expectType<Name.Errors.AlreadyTaken<'foo-bar'>>(as<Name.Parse<'foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())
			// Aliases
			expectType<Name.Errors.AlreadyTaken<'fooBar'>>(as<Name.Parse<'--foo --fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
			expectType<Name.Errors.AlreadyTaken<'foo-bar'>>(as<Name.Parse<'--foo --foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())
			expectType<Name.Errors.AlreadyTaken<'fooBar'>>(as<Name.Parse<'foo fooBar', { usedNames: 'foo-bar'; reservedNames: undefined }>>())
			expectType<Name.Errors.AlreadyTaken<'foo-bar'>>(as<Name.Parse<'foo foo-bar', { usedNames: 'fooBar'; reservedNames: undefined }>>())

	expectType<Name.Errors.LongTooShort<'v'>>(as<			Name.Parse<'--v'>>())
	expectType<Name.Errors.LongTooShort<'v'>>(as<			Name.Parse<'--ver --v'>>())
	expectType<Name.Errors.ShortTooLong<'vv'>>(as<		Name.Parse<'-vv'>>())

	expectType<Name.Errors.AliasDuplicate<'vv'>>(as<			Name.Parse<'--vv --vv'>>())
	expectType<Name.Errors.AliasDuplicate<'v-v'>>(as<			Name.Parse<'--v-v --v-v'>>())
	expectType<Name.Errors.AliasDuplicate<'v'>>(as<				Name.Parse<'-v -v'>>())
		// Mixing dash prefix style and kebab/camel case does not matter
		expectType<Name.Errors.AliasDuplicate<'foo-bar'>>(as<	Name.Parse<'--fooBar --foo-bar'>>())
		expectType<Name.Errors.AliasDuplicate<'fooBar'>>(as<	Name.Parse<'--foo-bar --fooBar'>>())
		expectType<Name.Errors.AliasDuplicate<'foo-bar'>>(as<	Name.Parse<'fooBar foo-bar'>>())
		expectType<Name.Errors.AliasDuplicate<'fooBar'>>(as<	Name.Parse<'foo-bar fooBar'>>())
		expectType<Name.Errors.AliasDuplicate<'fooBar'>>(as<	Name.Parse<'foo-bar --fooBar'>>())
		expectType<Name.Errors.AliasDuplicate<'fooBar'>>(as<	Name.Parse<'--foo-bar fooBar'>>())
		expectType<Name.Errors.AliasDuplicate<'foo-bar'>>(as<	Name.Parse<'fooBar --foo-bar'>>())
		expectType<Name.Errors.AliasDuplicate<'foo-bar'>>(as<	Name.Parse<'--fooBar foo-bar'>>())
}

//prettier-ignore
namespace _case {
	expectType<{ long: 'filePath'; short: undefined; aliases: { short: []; long: [] } }>(as<Name.Parse<'--file-path'>>())
}

//prettier-ignore
namespace _mixed {
	expectType<{ long: undefined; short: 'v'; aliases: { short: []; long: [] } }>(as<							Name.Parse<'-v'>>())
	expectType<{ long: undefined; short: 'v'; aliases: { short: ['x']; long: [] } }>(as<					Name.Parse<'-v -x'>>())
	expectType<{ long: undefined; short: 'v'; aliases: { short: ['x', 'y']; long: [] } }>(as<			Name.Parse<'-v -x -y'>>())
	expectType<{ long: 'vv'; short: undefined; aliases: { short: []; long: ['xx'] } }>(as<				Name.Parse<'--vv --xx'>>())
	expectType<{ long: 'vv'; short: undefined; aliases: { short: []; long: ['xx', 'yy'] } }>(as<	Name.Parse<'--vv --xx --yy'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						Name.Parse<'-v --vv -x --xx'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						Name.Parse<'v vv x xx'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						Name.Parse<'v --vv x xx'>>())
}

interface SomeLong {
  long: 'version'
  short: undefined
  aliases: { short: []; long: [] }
}

expectType<SomeLong>(as<Name.Parse<'--version'>>())
expectType<SomeLong>(as<Name.Parse<' --version'>>())
expectType<SomeLong>(as<Name.Parse<'  --version '>>())
expectType<SomeLong>(as<Name.Parse<'  --version  '>>())
expectType<SomeLong>(as<Name.Parse<' --version  '>>())
expectType<SomeLong>(as<Name.Parse<'version  '>>())

interface SomeShort {
  long: undefined
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
  short: undefined
  aliases: { short: []; long: [] }
}

expectType<SomeLongCamelCase>(as<Name.Parse<'--fooBar'>>())
expectType<SomeLongCamelCase>(as<Name.Parse<'--foo-bar'>>())
