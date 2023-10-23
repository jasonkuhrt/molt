import type { Strings } from '../prelude.js'
import type { BaseChecks, LongChecks, ReportFailures, ShortChecks, SomeFailures } from './checks.js'
import type { Name, NameEmpty } from './data.js'

// prettier-ignore
export namespace Errors {
	export type TrailingPipe = `Error: You have a trailing pipe. Pipes are for adding aliases. Add more names after your pipe or remove it.`
	export type Empty = `Error: You must specify at least one name for your flag.`
	export type Unknown = `Error: Cannot parse your flag expression.`
}

// prettier-ignore
type AddAliasLong<$Name extends Name, Variant extends string> = Omit<$Name, 'aliases'> & { aliases: { long: [...$Name['aliases']['long'], Strings.KebabToCamelCase<Variant>], short: $Name['aliases']['short'] }}
// prettier-ignore
type AddAliasShort<$Name extends Name, Variant extends string> = Omit<$Name, 'aliases'> & { aliases: { long: $Name['aliases']['long'], short: [...$Name['aliases']['short'], Variant] }}
// prettier-ignore
type AddLong<$Name extends Name, Variant extends string> = Omit<$Name, 'long'> & { long: Strings.KebabToCamelCase<Variant>  }
// prettier-ignore
type AddShort<$Name extends Name, Variant extends string> = Omit<$Name, 'short'> & { short: Variant  }
// prettier-ignore
type addCanonical<$Name extends Name> =
	Omit<$Name, 'canonical'> & {
		canonical:	$Name['long']  extends string ? $Name['long'] :
								$Name['short'] extends string ? $Name['short'] :
																								never // A valid flag always has either a long or short name
	}

export interface SomeLimits {
  reservedNames: string | undefined
  usedNames: string | undefined
}

interface SomeLimitsNone {
  reservedNames: undefined
  usedNames: undefined
}

export type Parse<
  E extends string,
  limits extends SomeLimits = SomeLimitsNone,
  names extends Name = NameEmpty,
> = _Parse<E, limits, names>

//prettier-ignore
type _Parse<E extends string, Limits extends SomeLimits, $Name extends Name> =
	// Done!
	E extends ``                                         	? NameEmpty extends $Name ? Errors.Empty : addCanonical<$Name> :

	// Trim leading and trailing whitespace
	E extends ` ${infer tail}`                           	? _Parse<tail, Limits, $Name> :
	E extends `${infer initial} `                        	? _Parse<initial, Limits, $Name> :

	// Capture a long flag & continue
	E extends `--${infer v} ${infer tail}`            	? LongChecks<v, Limits, $Name> extends SomeFailures ? ReportFailures<LongChecks<v, Limits, $Name>> :
																												 	$Name['long'] extends null ?
																												 		_Parse<tail, Limits, AddLong<$Name, v>> :
																												 	 	_Parse<tail, Limits, AddAliasLong<$Name, v>> :
	// Capture a long name & Done!
	E extends `--${infer v}` 							          	? LongChecks<v, Limits, $Name> extends SomeFailures ? ReportFailures<LongChecks<v, Limits, $Name>> :
																														$Name['long'] extends null ?
																														_Parse<'', Limits, AddLong<$Name, v>> :
																														_Parse<'', Limits, AddAliasLong<$Name, v>> :

	// Capture a short flag & continue
	E extends `-${infer v} ${infer tail}`            	? ShortChecks<v, Limits, $Name> extends SomeFailures ? ReportFailures<ShortChecks<v, Limits, $Name>> :
																														$Name['short'] extends null ?
																															_Parse<tail, Limits, AddShort<$Name, v>> :
																															_Parse<tail, Limits, AddAliasShort<$Name, v>> :
	// Capture a short name & Done!
	E extends `-${infer v}` 							            	? ShortChecks<v, Limits, $Name> extends SomeFailures ? ReportFailures<ShortChecks<v, Limits, $Name>> :
																														$Name['short'] extends null ?
																														_Parse<'', Limits, AddShort<$Name, v>> :
																														_Parse<'', Limits, AddAliasShort<$Name, v>> :

	// Capture a long flag & continue
	E extends `${infer v} ${infer tail}`             	? BaseChecks<v, Limits, $Name> extends SomeFailures ? ReportFailures<BaseChecks<v, Limits, $Name>> :
																														Strings.Length<v> extends 1 ?
																															$Name['short'] extends null ?
																																_Parse<tail, Limits, AddShort<$Name, v>> :
																																_Parse<tail, Limits, AddAliasShort<$Name, v>> :
																															$Name['long'] extends null ?
																																_Parse<tail, Limits, AddLong<$Name, v>> :
																																_Parse<tail, Limits, AddAliasLong<$Name, v>> :

	// Capture a short name & Done!
  E extends `${infer v}`                           	? BaseChecks<v, Limits, $Name> extends SomeFailures ? ReportFailures<BaseChecks<v, Limits, $Name>> :
																														Strings.Length<v> extends 1 ?
																															$Name['short'] extends null ?
																																_Parse<'', Limits, AddShort<$Name, v>> :
																																_Parse<'', Limits, AddAliasShort<$Name, v>> :
																															$Name['long'] extends null ?
																																_Parse<'', Limits, AddLong<$Name, v>> :
																																_Parse<'', Limits, AddAliasLong<$Name, v>> :

	Errors.Unknown
