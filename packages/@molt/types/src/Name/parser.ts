import type { Strings } from '../prelude.js'
import type { FilterFailures, Kinds, ReportFailures, SomeFailures } from './checks.js'
import type { Name, NameEmpty } from './data.js'

// prettier-ignore
export namespace Errors {
	export type TrailingPipe = `Error: You have a trailing pipe. Pipes are for adding aliases. Add more names after your pipe or remove it.`
	export type Empty = `Error: You must specify at least one name for your flag.`
	export type Unknown = `Error: Cannot parse your flag expression.`
}

export type BaseChecks<
  Variant extends string,
  limits extends SomeLimits,
  $FlagName extends Name,
> = FilterFailures<
  [
    Kinds.AliasDuplicate<$FlagName, Variant>,
    Kinds.AlreadyTaken<limits, Variant>,
    Kinds.Reserved<limits, Variant>,
  ]
>

export type LongChecks<
  Variant extends string,
  limits extends SomeLimits,
  $FlagName extends Name,
> = FilterFailures<[...BaseChecks<Variant, limits, $FlagName>, Kinds.LongTooShort<Variant>]>

export type ShortChecks<
  Variant extends string,
  limits extends SomeLimits,
  $FlagName extends Name,
> = FilterFailures<[...BaseChecks<Variant, limits, $FlagName>, Kinds.ShortTooLong<Variant>]>

// prettier-ignore
type AddAliasLong<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'aliases'> & { aliases: { long: [...$FlagName['aliases']['long'], Strings.KebabToCamelCase<Variant>], short: $FlagName['aliases']['short'] }}
// prettier-ignore
type AddAliasShort<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'aliases'> & { aliases: { long: $FlagName['aliases']['long'], short: [...$FlagName['aliases']['short'], Variant] }}
// prettier-ignore
type AddLong<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'long'> & { long: Strings.KebabToCamelCase<Variant>  }
// prettier-ignore
type AddShort<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'short'> & { short: Variant  }

export type SomeLimits = {
  reservedNames: string | undefined
  usedNames: string | undefined
}

type SomeLimitsNone = {
  reservedNames: undefined
  usedNames: undefined
}

// type x = Parse<'foo foo-bar',   { reservedNames: 'fooBar';  usedNames: undefined }>
// type x2 = LongChecks<'foo foo-bar',   { reservedNames: 'fooBar';  usedNames: undefined },NameEmpty>

export type Parse<
  E extends string,
  limits extends SomeLimits = SomeLimitsNone,
  names extends Name = NameEmpty,
> = _Parse<E, limits, names>

//prettier-ignore
type _Parse<E extends string, Limits extends SomeLimits, $FlagName extends Name> =
	// Done!
	E extends ``                                         	? NameEmpty extends $FlagName ? Errors.Empty : $FlagName :

	// Trim leading and trailing whitespace
	E extends ` ${infer tail}`                           	? _Parse<tail, Limits, $FlagName> :
	E extends `${infer initial} `                        	? _Parse<initial, Limits, $FlagName> :

	// Capture a long flag & continue
	E extends `--${infer v} ${infer tail}`            	? LongChecks<v, Limits, $FlagName> extends SomeFailures ? ReportFailures<LongChecks<v, Limits, $FlagName>> :
																												 	$FlagName['long'] extends undefined ?
																												 		_Parse<tail, Limits, AddLong<$FlagName, v>> :
																												 	 	_Parse<tail, Limits, AddAliasLong<$FlagName, v>> :
	// Capture a long name & Done!
	E extends `--${infer v}` 							          	? LongChecks<v, Limits, $FlagName> extends SomeFailures ? ReportFailures<LongChecks<v, Limits, $FlagName>> :
																														$FlagName['long'] extends undefined ?
																															AddLong<$FlagName, v> :
																															AddAliasLong<$FlagName, v> :

	// Capture a short flag & continue
	E extends `-${infer v} ${infer tail}`            	? ShortChecks<v, Limits, $FlagName> extends SomeFailures ? ReportFailures<ShortChecks<v, Limits, $FlagName>> :
																														$FlagName['short'] extends undefined ?
																															_Parse<tail, Limits, AddShort<$FlagName, v>> :
																															_Parse<tail, Limits, AddAliasShort<$FlagName, v>> :
	// Capture a short name & Done!
	E extends `-${infer v}` 							            	? ShortChecks<v, Limits, $FlagName> extends SomeFailures ? ReportFailures<ShortChecks<v, Limits, $FlagName>> :
																														$FlagName['short'] extends undefined ?
																															AddShort<$FlagName, v> :
																															AddAliasShort<$FlagName, v> :

	// Capture a long flag & continue
	E extends `${infer v} ${infer tail}`             	? BaseChecks<v, Limits, $FlagName> extends SomeFailures ? ReportFailures<BaseChecks<v, Limits, $FlagName>> :
																														Strings.Length<v> extends 1 ?
																															$FlagName['short'] extends undefined ?
																																_Parse<tail, Limits, AddShort<$FlagName, v>> :
																																_Parse<tail, Limits, AddAliasShort<$FlagName, v>> :
																															$FlagName['long'] extends undefined ?
																																_Parse<tail, Limits, AddLong<$FlagName, v>> :
																																_Parse<tail, Limits, AddAliasLong<$FlagName, v>> :

	// Capture a short name & Done!
  E extends `${infer v}`                           	? BaseChecks<v, Limits, $FlagName> extends SomeFailures ? ReportFailures<BaseChecks<v, Limits, $FlagName>> :
																														Strings.Length<v> extends 1 ?
																															$FlagName['short'] extends undefined ?
																																AddShort<$FlagName, v> :
																																AddAliasShort<$FlagName, v> :
																															$FlagName['long'] extends undefined ?
																																AddLong<$FlagName, v> :
																																AddAliasLong<$FlagName, v> :

	Errors.Unknown
