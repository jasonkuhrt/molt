import type { Strings } from '../prelude.js'
import type { FlagNames, FlagNamesEmpty } from './data.js'

// prettier-ignore
export namespace Checks {
	export type LongFlagTooShort<Name extends string> = Strings.Length<Name> extends 1 ? true : false
	export type ShortFlagTooLong<Name extends string> = Strings.Length<Name> extends 1 ? false : true
	export type AliasDuplicate<Names extends FlagNames, Name extends string> =  Strings.KebabToCamelCase<Name> extends Names['long'] | Names['short'] ? true : false
	export type NameAlreadyTaken<Limits extends SomeLimits, Name extends string> =
		Limits['usedNames'] extends undefined 																											     ? false :
		Strings.KebabToCamelCase<Name> extends Strings.KebabToCamelCase<Exclude<Limits['usedNames'], undefined>> ? true :
																																																		   false
	export type NameReserved<Limits extends SomeLimits, Name extends string> =
		Limits['reservedNames'] extends undefined 																														? false :
		Strings.KebabToCamelCase<Name> extends Strings.KebabToCamelCase<Exclude<Limits['reservedNames'], undefined>> 	? true :
																																																						false
}

// prettier-ignore
export namespace Errors {
	export type LongFlagTooShort<Given extends string> = `Error: A long flag must be two (2) or more characters but you have: '--${Given}'.`
	export type ShortFlagTooLong<Given extends string> = `Error: A short flag must be exactly one (1) character but you have: '-${Given}'.`
	export type TrailingPipe = `Error: You have a trailing pipe. Pipes are for adding aliases. Add more names after your pipe or remove it.`
	export type Empty = `Error: You must specify at least one name for your flag.`
	export type Unknown = `Error: Cannot parse your flag expression.`
	export type AliasDuplicate<Name extends string> = `Error: Your alias "${Name}" is a duplicate.`
	export type NameAlreadyTaken<Name extends string> = `Error: The name "${Name}" cannot be used because it is already used for another flag.` 
	export type NameReserved<Name extends string> = `Error: The name "${Name}" cannot be used because it is reserved.`
}

// prettier-ignore
export type BaseFlagNameChecks<name extends string, limits extends SomeLimits, names extends FlagNames> = 
	Checks.AliasDuplicate<names, name> 		extends true ? Errors.AliasDuplicate<name> :
	Checks.NameAlreadyTaken<limits, name> extends true ? Errors.NameAlreadyTaken<name> :
	Checks.NameReserved<limits, name> 		extends true ? Errors.NameReserved<name> :
	null

// prettier-ignore
export type DashPrefixedLongFlagNameChecks<name extends string, limits extends SomeLimits, names extends FlagNames> = 
	BaseFlagNameChecks<name, limits, names> extends string ? BaseFlagNameChecks<name, limits, names> :
	Checks.LongFlagTooShort<name>                       extends true ? Errors.LongFlagTooShort<name> :
	null

// prettier-ignore
export type DashPrefixedShortFlagNameChecks<name extends string, limits extends SomeLimits, names extends FlagNames> = 
	BaseFlagNameChecks<name, limits, names> extends string ? BaseFlagNameChecks<name, limits, names> :
	Checks.ShortFlagTooLong<name>                       extends true ? Errors.ShortFlagTooLong<name> :
	null

// prettier-ignore
type AddAliasLong<Names extends FlagNames, Name extends string> = Omit<Names, 'aliases'> & { aliases: { long: [...Names['aliases']['long'], Strings.KebabToCamelCase<Name>], short: Names['aliases']['short'] }}
// prettier-ignore
type AddAliasShort<Names extends FlagNames, Name extends string> = Omit<Names, 'aliases'> & { aliases: { long: Names['aliases']['long'], short: [...Names['aliases']['short'], Name] }}
// prettier-ignore
type AddLong<Names extends FlagNames, Name extends string> = Omit<Names, 'long'> & { long: Strings.KebabToCamelCase<Name>  }
// prettier-ignore
type AddShort<Names extends FlagNames, Name extends string> = Omit<Names, 'short'> & { short: Name  }

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
  names extends FlagNames = FlagNamesEmpty,
> = ParseFlagNameDo<E, limits, names>

//prettier-ignore
type ParseFlagNameDo<E extends string, Limits extends SomeLimits, $Name extends FlagNames> =
	// Done!
	E extends ``                                         	? FlagNamesEmpty extends $Name ? Errors.Empty : $Name :

	// Trim leading and trailing whitespace
	E extends ` ${infer tail}`                           	? ParseFlagNameDo<tail, Limits, $Name> :
	E extends `${infer initial} `                        	? ParseFlagNameDo<initial, Limits, $Name> :

	// Capture a long flag & continue
	E extends `--${infer v} ${infer tail}`            	? DashPrefixedLongFlagNameChecks<v, Limits, $Name> extends string ?
																												 	DashPrefixedLongFlagNameChecks<v, Limits, $Name> :
																												 	$Name['long'] extends undefined ?
																												 		ParseFlagNameDo<tail, Limits, AddLong<$Name, v>> :
																												 	 	ParseFlagNameDo<tail, Limits, AddAliasLong<$Name, v>> :
	// Capture a long name & Done!
	E extends `--${infer v}` 							          	? DashPrefixedLongFlagNameChecks<v, Limits, $Name> extends string ?
																														DashPrefixedLongFlagNameChecks<v, Limits, $Name> :
																														$Name['long'] extends undefined ?
																															AddLong<$Name, v> :
																															AddAliasLong<$Name, v> :

	// Capture a short flag & continue
	E extends `-${infer v} ${infer tail}`            	? DashPrefixedShortFlagNameChecks<v, Limits, $Name> extends string ?
																														DashPrefixedShortFlagNameChecks<v, Limits, $Name> :
																														$Name['short'] extends undefined ?
																															ParseFlagNameDo<tail, Limits, AddShort<$Name, v>> :
																															ParseFlagNameDo<tail, Limits, AddAliasShort<$Name, v>> :
	// Capture a short name & Done!
	E extends `-${infer v}` 							            	? DashPrefixedShortFlagNameChecks<v, Limits, $Name> extends string ?
																														DashPrefixedShortFlagNameChecks<v, Limits, $Name> :
																														$Name['short'] extends undefined ?
																															AddShort<$Name, v> :
																															AddAliasShort<$Name, v> :

	// Capture a long flag & continue
	E extends `${infer v} ${infer tail}`             	? BaseFlagNameChecks<v, Limits, $Name> extends string ?
																														DashPrefixedLongFlagNameChecks<v, Limits, $Name> :
																														Strings.Length<v> extends 1 ?
																															$Name['short'] extends undefined ?
																																ParseFlagNameDo<tail, Limits, AddShort<$Name, v>> :
																																ParseFlagNameDo<tail, Limits, AddAliasShort<$Name, v>> :
																															$Name['long'] extends undefined ?
																																ParseFlagNameDo<tail, Limits, AddLong<$Name, v>> :
																																ParseFlagNameDo<tail, Limits, AddAliasLong<$Name, v>> :

	// Capture a short name & Done!
  E extends `${infer v}`                           	? BaseFlagNameChecks<v, Limits, $Name> extends string ?
																														DashPrefixedShortFlagNameChecks<v, Limits, $Name> :
																														Strings.Length<v> extends 1 ?
																															$Name['short'] extends undefined ?
																																AddShort<$Name, v> :
																																AddAliasShort<$Name, v> :
																															$Name['long'] extends undefined ?
																																AddLong<$Name, v> :
																																AddAliasLong<$Name, v> :

	Errors.Unknown
