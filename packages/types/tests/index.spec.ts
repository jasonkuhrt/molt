import { Errors, ParseFlagNameExpression } from '../src'

// prettier-ignore
namespace tests {
	const Superset = <T, U extends T>(): [T, U] => 0 as any

	Superset<ParseFlagNameExpression<'-v -x'>, { long: undefined; short: 'v'; aliases: { short: ['x'], long: [] } }>()
	Superset<ParseFlagNameExpression<'-v -x -y'>, { long: undefined; short: 'v'; aliases: { short: ['x','y'], long: [] } }>()
	Superset<ParseFlagNameExpression<'--vv --xx'>, { long: 'vv'; short: undefined; aliases: { short: [], long:  ['xx'] } }>()
	Superset<ParseFlagNameExpression<'--vv --xx --yy'>, { long: 'vv'; short: undefined; aliases: { short: [], long:  ['xx','yy'] } }>()
	Superset<ParseFlagNameExpression<'-v --vv -x --xx'>, { long: 'vv'; short: 'v'; aliases: { short: ['x'], long:  ['xx'] } }>()
	Superset<ParseFlagNameExpression<'v vv x xx'>, { long: 'vv'; short: 'v'; aliases: { short: ['x'], long:  ['xx'] } }>()
	Superset<ParseFlagNameExpression<'v --vv x xx'>, { long: 'vv'; short: 'v'; aliases: { short: ['x'], long:  ['xx'] } }>()

	Superset<ParseFlagNameExpression<''>, Errors.Empty>()
	Superset<ParseFlagNameExpression<' '>, Errors.Empty>()
	Superset<ParseFlagNameExpression<'--abc', { reservedNames: 'abc'; usedNames: undefined }>, Errors.NameReserved<'abc'>>()
	Superset<ParseFlagNameExpression<'--abc', { usedNames: 'abc'; reservedNames: undefined }>, Errors.NameAlreadyTaken<'abc'>>()
	Superset<ParseFlagNameExpression<'-a', { reservedNames: 'a'; usedNames: undefined }>, Errors.NameReserved<'a'>>()
	Superset<ParseFlagNameExpression<'-a', { usedNames: 'a'; reservedNames: undefined }>, Errors.NameAlreadyTaken<'a'>>()
	Superset<ParseFlagNameExpression<'--v'>, Errors.LongFlagTooShort<'v'>>()
	Superset<ParseFlagNameExpression<'--ver --v'>, Errors.LongFlagTooShort<'v'>>()
	Superset<ParseFlagNameExpression<'-vv'>, Errors.ShortFlagTooLong<'vv'>>()
	Superset<ParseFlagNameExpression<'--vv --vv'>, Errors.AliasDuplicate<'vv'>>()
	Superset<ParseFlagNameExpression<'-v -v'>, Errors.AliasDuplicate<'v'>>()

	type SomeLong = { long: 'version'; short: undefined; aliases: {short:[],long:[]} }

	Superset<ParseFlagNameExpression<'--version'>, SomeLong>()
	Superset<ParseFlagNameExpression<' --version'>, SomeLong>()
	Superset<ParseFlagNameExpression<' --version '>, SomeLong>()
	Superset<ParseFlagNameExpression<'  --version '>, SomeLong>()
	Superset<ParseFlagNameExpression<'  --version  '>, SomeLong>()
	Superset<ParseFlagNameExpression<' --version  '>, SomeLong>()
	Superset<ParseFlagNameExpression<'--version  '>, SomeLong>()
	Superset<ParseFlagNameExpression<'version  '>, SomeLong>()

	type SomeShort = { long: undefined; short: 'v'; aliases: {short:[],long:[]} }

	Superset<ParseFlagNameExpression<'-v'>, SomeShort>()
	Superset<ParseFlagNameExpression<' -v'>, SomeShort>()
	Superset<ParseFlagNameExpression<' -v '>, SomeShort>()
	Superset<ParseFlagNameExpression<'  -v '>, SomeShort>()
	Superset<ParseFlagNameExpression<'  -v  '>, SomeShort>()
	Superset<ParseFlagNameExpression<' -v  '>, SomeShort>()
	Superset<ParseFlagNameExpression<'-v  '>, SomeShort>()
	Superset<ParseFlagNameExpression<'v  '>, SomeShort>()

	type SomeLongShort = { long: 'version'; short: 'v'; aliases: {short:[],long:[]} }

	Superset<ParseFlagNameExpression<'--version -v'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<' --version -v'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'--version -v'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  --version -v'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'--version  -v'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  --version -v'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  --version -v '>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  --version -v  '>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  --version  -v  '>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'-v --version'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<' -v --version'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'-v --version'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  -v --version'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'-v  --version'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  -v --version'>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  -v --version '>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  -v --version  '>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  -v  --version  '>, SomeLongShort>()
	Superset<ParseFlagNameExpression<'  v  version  '>, SomeLongShort>()
}
