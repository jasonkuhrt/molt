import type { BaseChecks, LongChecks, ReportFailures, ShortChecks, SomeFailures } from './checks.js'
import type { Name, NameEmpty } from './data.js'
import type { $, Objects, Strings, Tuples } from 'hotscript'

// prettier-ignore
export namespace Errors {
	export type TrailingPipe = `Error: You have a trailing pipe. Pipes are for adding aliases. Add more names after your pipe or remove it.`
	export type Empty = `Error: You must specify at least one name for your flag.`
	export type Unknown = `Error: Cannot parse your flag expression.`
}

// prettier-ignore
type Add<
	Kind extends 'short'|'long',
	$Name extends Name,
	Variant extends string
> =
	Kind extends 'short' ?
		$Name['short'] extends null 	? AddShort<$Name,Variant> :
																		AddAliasShort<$Name,Variant> :
	Kind extends 'long' ?
		$Name['long'] extends null 	? AddLong<$Name,Variant> :
																 	AddAliasLong<$Name,Variant> :
	never

// prettier-ignore
type AddAliasLong<$Name extends Name, Variant extends string> =
	$<Objects.Update<'aliases.long', Tuples.Append<$<Strings.CamelCase,Variant>>>, $Name>

// prettier-ignore
type AddAliasShort<$Name extends Name, Variant extends string> =
	$<Objects.Update<'aliases.short', Tuples.Append<Variant>>, $Name>

// prettier-ignore
type AddLong<$Name extends Name, Variant extends string> =
	$<Objects.Update<'long', $<Strings.CamelCase,Variant>>, $Name>

// prettier-ignore
type AddShort<$Name extends Name, Variant extends string> =
	$<Objects.Update<'short', Variant>, $Name>

// prettier-ignore
type addCanonical<$Name extends Name> =
	$<Objects.Update<'canonical', 
			$Name['long']  extends string ? $Name['long'] :
			$Name['short'] extends string ? $Name['short'] :
																			never // A valid flag always has either a long or short name
	>, $Name>

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
	E extends `--${infer v} ${infer tail}`            	? LongChecks<v, Limits, $Name> extends SomeFailures ?
																													ReportFailures<LongChecks<v, Limits, $Name>> :
																													_Parse<tail, Limits,
																														Add<
																															'long',
																															$Name,
																															v
																													>
																												>
																										:
	// Capture a long name & Done!
	E extends `--${infer v}` 							          	? LongChecks<v, Limits, $Name> extends SomeFailures ?
																												ReportFailures<LongChecks<v, Limits, $Name>> :
																												_Parse<'', Limits,
																													Add<
																														'long',
																														$Name,
																														v
																													>
																												>
																										:

	// Capture a short flag & continue
	E extends `-${infer v} ${infer tail}`            	? ShortChecks<v, Limits, $Name> extends SomeFailures ?
																												ReportFailures<ShortChecks<v, Limits, $Name>> :
																												_Parse<tail, Limits,
																													Add<
																														'short',
																														$Name,
																														v
																													>
																												>
																											:
	// Capture a short name & Done!
	E extends `-${infer v}` 							            	? ShortChecks<v, Limits, $Name> extends SomeFailures ?
																													ReportFailures<ShortChecks<v, Limits, $Name>> :
																													_Parse<'', Limits,
																														Add<
																															'short',
																															$Name,
																															v
																														>
																													>
																											:

	// Capture a long flag & continue
	E extends `${infer v} ${infer tail}`             	? BaseChecks<v, Limits, $Name> extends SomeFailures ?
																												ReportFailures<BaseChecks<v, Limits, $Name>> :
																												_Parse<tail, Limits,
																													Add<
																														$<Strings.Length,v> extends 1 ? 'short' : 'long',
																														$Name,
																														v
																													>
																												>
																										:
																													

  E extends `${infer v}`                           	? BaseChecks<v, Limits, $Name> extends SomeFailures ?
																												ReportFailures<BaseChecks<v, Limits, $Name>> :
																												_Parse<'', Limits,
																													Add<
																														$<Strings.Length,v> extends 1 ? 'short' : 'long',
																														$Name,
																														v
																													>
																												> 	
																										:

	Errors.Unknown
