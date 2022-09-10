import { FlagName } from '../src'
import { IsExact } from 'conditional-type-checks'

// prettier-ignore
type _TestMixed =
	| IsExact<FlagName.Parse<'-v -x'>, 					{ long: undefined; short: 'v';  aliases: { short: ['x'], long: [] } }>
	| IsExact<FlagName.Parse<'-v -x -y'>, 			{ long: undefined; short: 'v';  aliases: { short: ['x','y'], long: [] } }>
	| IsExact<FlagName.Parse<'--vv --xx'>, 			{ long: 'vv'; short: undefined; aliases: { short: [], long:  ['xx'] } }>
	| IsExact<FlagName.Parse<'--vv --xx --yy'>, { long: 'vv'; short: undefined; aliases: { short: [], long:  ['xx','yy'] } }>
	| IsExact<FlagName.Parse<'-v --vv -x --xx'>,{ long: 'vv'; short: 'v'; 			aliases: { short: ['x'], long:  ['xx'] } }>
	| IsExact<FlagName.Parse<'v vv x xx'>, 			{ long: 'vv'; short: 'v'; 			aliases: { short: ['x'], long:  ['xx'] } }>
	| IsExact<FlagName.Parse<'v --vv x xx'>, 		{ long: 'vv'; short: 'v'; 			aliases: { short: ['x'], long:  ['xx'] } }>

// prettier-ignore
type _TestErrors =
	| IsExact<FlagName.Parse<''>, FlagName.Errors.Empty>
	| IsExact<FlagName.Parse<' '>, FlagName.Errors.Empty>
	| IsExact<FlagName.Parse<'--abc', { reservedNames: 'abc'; usedNames: undefined }>, FlagName.Errors.NameReserved<'abc'>>
	| IsExact<FlagName.Parse<'--abc', { usedNames: 'abc'; reservedNames: undefined }>, FlagName.Errors.NameAlreadyTaken<'abc'>>
	| IsExact<FlagName.Parse<'-a', { reservedNames: 'a'; usedNames: undefined }>, FlagName.Errors.NameReserved<'a'>>
	| IsExact<FlagName.Parse<'-a', { usedNames: 'a'; reservedNames: undefined }>, FlagName.Errors.NameAlreadyTaken<'a'>>
	| IsExact<FlagName.Parse<'--v'>, FlagName.Errors.LongFlagTooShort<'v'>>
	| IsExact<FlagName.Parse<'--ver --v'>, FlagName.Errors.LongFlagTooShort<'v'>>
	| IsExact<FlagName.Parse<'-vv'>, FlagName.Errors.ShortFlagTooLong<'vv'>>
	| IsExact<FlagName.Parse<'--vv --vv'>, FlagName.Errors.AliasDuplicate<'vv'>>
	| IsExact<FlagName.Parse<'-v -v'>, FlagName.Errors.AliasDuplicate<'v'>>

type SomeLong = {
  long: 'version'
  short: undefined
  aliases: { short: []; long: [] }
}

// prettier-ignore
type _TestLongs =
	| IsExact<FlagName.Parse<'--version'>, SomeLong>
	| IsExact<FlagName.Parse<' --version'>, SomeLong>
	| IsExact<FlagName.Parse<' --version '>, SomeLong>
	| IsExact<FlagName.Parse<'  --version '>, SomeLong>
	| IsExact<FlagName.Parse<'  --version  '>, SomeLong>
	| IsExact<FlagName.Parse<' --version  '>, SomeLong>
	| IsExact<FlagName.Parse<'--version  '>, SomeLong>
	| IsExact<FlagName.Parse<'version  '>, SomeLong>

type SomeShort = {
  long: undefined
  short: 'v'
  aliases: { short: []; long: [] }
}

// prettier-ignore
type _TestShorts =
	| IsExact<FlagName.Parse<'-v'>, SomeShort>
	| IsExact<FlagName.Parse<' -v'>, SomeShort>
	| IsExact<FlagName.Parse<' -v '>, SomeShort>
	| IsExact<FlagName.Parse<'  -v '>, SomeShort>
	| IsExact<FlagName.Parse<'  -v  '>, SomeShort>
	| IsExact<FlagName.Parse<' -v  '>, SomeShort>
	| IsExact<FlagName.Parse<'-v  '>, SomeShort>
	| IsExact<FlagName.Parse<'v  '>, SomeShort>

type SomeLongShort = {
  long: 'version'
  short: 'v'
  aliases: { short: []; long: [] }
}

// prettier-ignore
type _TestLongShorts =
	| IsExact<FlagName.Parse<'--version -v'>, SomeLongShort>
	| IsExact<FlagName.Parse<' --version -v'>, SomeLongShort>
	| IsExact<FlagName.Parse<'--version -v'>, SomeLongShort>
	| IsExact<FlagName.Parse<'  --version -v'>, SomeLongShort>
	| IsExact<FlagName.Parse<'--version  -v'>, SomeLongShort>
	| IsExact<FlagName.Parse<'  --version -v'>, SomeLongShort>
	| IsExact<FlagName.Parse<'  --version -v '>, SomeLongShort>
	| IsExact<FlagName.Parse<'  --version -v  '>, SomeLongShort>
	| IsExact<FlagName.Parse<'  --version  -v  '>, SomeLongShort>
	| IsExact<FlagName.Parse<'-v --version'>, SomeLongShort>
	| IsExact<FlagName.Parse<' -v --version'>, SomeLongShort>
	| IsExact<FlagName.Parse<'-v --version'>, SomeLongShort>
	| IsExact<FlagName.Parse<'  -v --version'>, SomeLongShort>
	| IsExact<FlagName.Parse<'-v  --version'>, SomeLongShort>
	| IsExact<FlagName.Parse<'  -v --version'>, SomeLongShort>
	| IsExact<FlagName.Parse<'  -v --version '>, SomeLongShort>
	| IsExact<FlagName.Parse<'  -v --version  '>, SomeLongShort>
	| IsExact<FlagName.Parse<'  -v  --version  '>, SomeLongShort>
	| IsExact<FlagName.Parse<'  v  version  '>, SomeLongShort>
