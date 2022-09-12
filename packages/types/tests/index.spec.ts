import { FlagName } from '../src'
import { expectType } from 'tsd'

// eslint-disable-next-line
const as = <T>(): T => 0 as any

// TestMixed
//prettier-ignore
namespace _ {
	expectType<{ long: undefined; short: 'v'; aliases: { short: []; long: [] } }>(as<							FlagName.Parse<'-v'>>())
	expectType<{ long: undefined; short: 'v'; aliases: { short: ['x']; long: [] } }>(as<					FlagName.Parse<'-v -x'>>())
	expectType<{ long: undefined; short: 'v'; aliases: { short: ['x', 'y']; long: [] } }>(as<			FlagName.Parse<'-v -x -y'>>())
	expectType<{ long: 'vv'; short: undefined; aliases: { short: []; long: ['xx'] } }>(as<				FlagName.Parse<'--vv --xx'>>())
	expectType<{ long: 'vv'; short: undefined; aliases: { short: []; long: ['xx', 'yy'] } }>(as<	FlagName.Parse<'--vv --xx --yy'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						FlagName.Parse<'-v --vv -x --xx'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						FlagName.Parse<'v vv x xx'>>())
	expectType<{ long: 'vv'; short: 'v'; aliases: { short: ['x']; long: ['xx'] } }>(as<						FlagName.Parse<'v --vv x xx'>>())
}

// prettier-ignore
namespace _TestErrors {
	expectType<FlagName.Errors.Empty>(as<											FlagName.Parse<''>>())
	expectType<FlagName.Errors.Empty>(as<											FlagName.Parse<' '>>())
	expectType<FlagName.Errors.NameReserved<'abc'>>(as<				FlagName.Parse<'--abc', { reservedNames: 'abc'; usedNames: undefined }>>())
	expectType<FlagName.Errors.NameAlreadyTaken<'abc'>>(as<		FlagName.Parse<'--abc', { usedNames: 'abc'; reservedNames: undefined }>>())
	expectType<FlagName.Errors.NameReserved<'a'>>(as<					FlagName.Parse<'-a', { reservedNames: 'a'; usedNames: undefined }>>())
	expectType<FlagName.Errors.NameAlreadyTaken<'a'>>(as<			FlagName.Parse<'-a', { usedNames: 'a'; reservedNames: undefined }>>())
	expectType<FlagName.Errors.LongFlagTooShort<'v'>>(as<			FlagName.Parse<'--v'>>())
	expectType<FlagName.Errors.LongFlagTooShort<'v'>>(as<			FlagName.Parse<'--ver --v'>>())
	expectType<FlagName.Errors.ShortFlagTooLong<'vv'>>(as<		FlagName.Parse<'-vv'>>())
	expectType<FlagName.Errors.AliasDuplicate<'vv'>>(as<			FlagName.Parse<'--vv --vv'>>())
	expectType<FlagName.Errors.AliasDuplicate<'v'>>(as<				FlagName.Parse<'-v -v'>>())
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

type SomeLongShort = {
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

expectType<{ long: 'filePath' }>(as<FlagName.Parse<'--file-path'>>())
