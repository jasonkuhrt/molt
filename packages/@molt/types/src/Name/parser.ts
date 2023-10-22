import type { Strings } from '../prelude.js'
import type { Name, NameEmpty } from './data.js'

// prettier-ignore
export namespace Checks {
	export type LongTooShort<Variant extends string> =
		Strings.Length<Variant> extends 1 ? true : false

	export type ShortTooLong<Variant extends string> =
		Strings.Length<Variant> extends 1 ? false : true

	export type AliasDuplicate<$Name extends Name, Variant extends string> =
		Strings.KebabToCamelCase<Variant> extends $Name['long'] | $Name['short'] ? true : false

	export type AlreadyTaken<Limits extends SomeLimits, Name extends string> =
		Limits['usedNames'] extends undefined 																											     					? false :
		Strings.KebabToCamelCase<Name> extends Strings.KebabToCamelCase<Exclude<Limits['usedNames'], undefined>> 	? true :
																																																		   					false
	export type Reserved<Limits extends SomeLimits, Name extends string> =
		Limits['reservedNames'] extends undefined 																																		? false :
		Strings.KebabToCamelCase<Name> extends Strings.KebabToCamelCase<Exclude<Limits['reservedNames'], undefined>> 	? true :
																																																										false
}

// prettier-ignore
export namespace Errors {
	export type LongTooShort<Given extends string> = `Error: A long flag must be two (2) or more characters but you have: '--${Given}'.`
	export type ShortTooLong<Given extends string> = `Error: A short flag must be exactly one (1) character but you have: '-${Given}'.`
	export type TrailingPipe = `Error: You have a trailing pipe. Pipes are for adding aliases. Add more names after your pipe or remove it.`
	export type Empty = `Error: You must specify at least one name for your flag.`
	export type Unknown = `Error: Cannot parse your flag expression.`
	export type AliasDuplicate<Variant extends string> = `Error: Your alias "${Variant}" is a duplicate.`
	export type AlreadyTaken<Variant extends string> = `Error: The name "${Variant}" cannot be used because it is already used for another flag.` 
	export type Reserved<Variant extends string> = `Error: The name "${Variant}" cannot be used because it is reserved.`
}

// prettier-ignore
export type BaseFlagNameChecks<Variant extends string, limits extends SomeLimits, $FlagName extends Name> = 
	Checks.AliasDuplicate<$FlagName, Variant>	extends true 	? Errors.AliasDuplicate<Variant> :
	Checks.AlreadyTaken<limits, Variant> extends true 			? Errors.AlreadyTaken<Variant> :
	Checks.Reserved<limits, Variant> extends true 					? Errors.Reserved<Variant> :
																														null

// prettier-ignore
export type DashPrefixedLongFlagNameChecks<Variant extends string, limits extends SomeLimits, $FlagName extends Name> = 
	BaseFlagNameChecks<Variant, limits, $FlagName> extends string 		? BaseFlagNameChecks<Variant, limits, $FlagName> :
	Checks.LongTooShort<Variant> extends true 												? Errors.LongTooShort<Variant> :
																																			null

// prettier-ignore
export type DashPrefixedShortFlagNameChecks<Variant extends string, limits extends SomeLimits, $FlagName extends Name> = 
	BaseFlagNameChecks<Variant, limits, $FlagName> extends string 	? BaseFlagNameChecks<Variant, limits, $FlagName> :
	Checks.ShortTooLong<Variant> extends true 											? Errors.ShortTooLong<Variant> :
																																		null

// prettier-ignore
type AddAliasLong<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'aliases'> & { aliases: { long: [...$FlagName['aliases']['long'], Strings.KebabToCamelCase<Variant>], short: $FlagName['aliases']['short'] }}
// prettier-ignore
type AddAliasShort<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'aliases'> & { aliases: { long: $FlagName['aliases']['long'], short: [...$FlagName['aliases']['short'], Variant] }}
// prettier-ignore
type AddLong<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'long'> & { long: Strings.KebabToCamelCase<Variant>  }
// prettier-ignore
type AddShort<$FlagName extends Name, Variant extends string> = Omit<$FlagName, 'short'> & { short: Variant  }

type SomeLimits = {
  reservedNames: string | undefined
  usedNames: string | undefined
}

type SomeLimitsNone = {
  reservedNames: undefined
  usedNames: undefined
}

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
	E extends `--${infer v} ${infer tail}`            	? DashPrefixedLongFlagNameChecks<v, Limits, $FlagName> extends string ?
																												 	DashPrefixedLongFlagNameChecks<v, Limits, $FlagName> :
																												 	$FlagName['long'] extends undefined ?
																												 		_Parse<tail, Limits, AddLong<$FlagName, v>> :
																												 	 	_Parse<tail, Limits, AddAliasLong<$FlagName, v>> :
	// Capture a long name & Done!
	E extends `--${infer v}` 							          	? DashPrefixedLongFlagNameChecks<v, Limits, $FlagName> extends string ?
																														DashPrefixedLongFlagNameChecks<v, Limits, $FlagName> :
																														$FlagName['long'] extends undefined ?
																															AddLong<$FlagName, v> :
																															AddAliasLong<$FlagName, v> :

	// Capture a short flag & continue
	E extends `-${infer v} ${infer tail}`            	? DashPrefixedShortFlagNameChecks<v, Limits, $FlagName> extends string ?
																														DashPrefixedShortFlagNameChecks<v, Limits, $FlagName> :
																														$FlagName['short'] extends undefined ?
																															_Parse<tail, Limits, AddShort<$FlagName, v>> :
																															_Parse<tail, Limits, AddAliasShort<$FlagName, v>> :
	// Capture a short name & Done!
	E extends `-${infer v}` 							            	? DashPrefixedShortFlagNameChecks<v, Limits, $FlagName> extends string ?
																														DashPrefixedShortFlagNameChecks<v, Limits, $FlagName> :
																														$FlagName['short'] extends undefined ?
																															AddShort<$FlagName, v> :
																															AddAliasShort<$FlagName, v> :

	// Capture a long flag & continue
	E extends `${infer v} ${infer tail}`             	? BaseFlagNameChecks<v, Limits, $FlagName> extends string ?
																														DashPrefixedLongFlagNameChecks<v, Limits, $FlagName> :
																														Strings.Length<v> extends 1 ?
																															$FlagName['short'] extends undefined ?
																																_Parse<tail, Limits, AddShort<$FlagName, v>> :
																																_Parse<tail, Limits, AddAliasShort<$FlagName, v>> :
																															$FlagName['long'] extends undefined ?
																																_Parse<tail, Limits, AddLong<$FlagName, v>> :
																																_Parse<tail, Limits, AddAliasLong<$FlagName, v>> :

	// Capture a short name & Done!
  E extends `${infer v}`                           	? BaseFlagNameChecks<v, Limits, $FlagName> extends string ?
																														DashPrefixedShortFlagNameChecks<v, Limits, $FlagName> :
																														Strings.Length<v> extends 1 ?
																															$FlagName['short'] extends undefined ?
																																AddShort<$FlagName, v> :
																																AddAliasShort<$FlagName, v> :
																															$FlagName['long'] extends undefined ?
																																AddLong<$FlagName, v> :
																																AddAliasLong<$FlagName, v> :

	Errors.Unknown
