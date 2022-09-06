export * as Helpers from './helpers'
import { FlagNames, FlagNamesEmpty } from './helpers'
import { Str } from './prelude'
import { Any } from 'ts-toolbelt'

// prettier-ignore
namespace Checks {
	export type LongFlagTooShort<Name extends string> = Str.Length<Name> extends 1 ? true : false
	export type ShortFlagTooLong<Name extends string> = Str.Length<Name> extends 1 ? false : true
	export type AliasDuplicate<Names extends FlagNames, Name extends string> =  Name extends Names['long'] | Names['short'] ? true : false
	export type NameAlreadyTaken<Limits extends SomeLimits, Name extends string> = Name extends Limits['usedNames'] ? true : false
	export type NameReserved<Limits extends SomeLimits, Name extends string> = Name extends Limits['reservedNames'] ? true : false
}

// prettier-ignore
export namespace Errors {
	export type Is<T> = T extends string ? Str.StartsWith<'Error: ', T> : false
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
type AddAliasLong<Names extends FlagNames, Name extends string> = Omit<Names, 'aliases'> & { aliases: { long: [...Names['aliases']['long'], Name], short: Names['aliases']['short'] }}
// prettier-ignore
type AddAliasShort<Names extends FlagNames, Name extends string> = Omit<Names, 'aliases'> & { aliases: { long: Names['aliases']['long'], short: [...Names['aliases']['short'], Name] }}
// prettier-ignore
type AddLong<Names extends FlagNames, Name extends string> = Omit<Names,'long'> & { long: Name  }
// prettier-ignore
type AddShort<Names extends FlagNames, Name extends string> = Omit<Names,'short'> & { short: Name  }

type SomeLimits = {
  reservedNames: string | undefined
  usedNames: string | undefined
}

type SomeLimitsNone = {
  reservedNames: undefined
  usedNames: undefined
}

export type ParseFlagNameExpression<
  E extends string,
  limits extends SomeLimits = SomeLimitsNone,
  names extends FlagNames = FlagNamesEmpty
> = Any.Compute<ParseFlagNameExpressionDo<E, limits, names>>

//prettier-ignore
type ParseFlagNameExpressionDo<E extends string, limits extends SomeLimits, names extends FlagNames> =
	// Done!
	E extends ``                                         ?  FlagNamesEmpty extends names ? Errors.Empty : names :

	// Trim leading and trailing whitespace
	E extends ` ${infer tail}`                           ? ParseFlagNameExpressionDo<tail, limits, names> :
	E extends `${infer initial} `                        ? ParseFlagNameExpressionDo<initial, limits, names> :

	// Capture a long flag & continue
	E extends `--${infer name} ${infer tail}`            ? Checks.LongFlagTooShort<name> extends true ? Errors.LongFlagTooShort<name> :
																												 Checks.AliasDuplicate<names, name> extends true ? Errors.AliasDuplicate<name> :
																												 Checks.NameAlreadyTaken<limits, name> extends true ? Errors.NameAlreadyTaken<name> :
																												 Checks.NameReserved<limits, name> extends true ? Errors.NameReserved<name> :
																												 names['long'] extends undefined ?
																												 	 ParseFlagNameExpressionDo<tail, limits, Omit<names,'long'> & { long: name  }> :
																												 	 ParseFlagNameExpressionDo<tail, limits, AddAliasLong<names, name>> :
	// Capture a long name & Done!
	E extends `--${infer name}` 							           ? Checks.LongFlagTooShort<name> extends true ? Errors.LongFlagTooShort<name> :
																												 Checks.AliasDuplicate<names, name> extends true ? Errors.AliasDuplicate<name> :
																												 Checks.NameAlreadyTaken<limits, name> extends true ? Errors.NameAlreadyTaken<name> :
																												 Checks.NameReserved<limits, name> extends true ? Errors.NameReserved<name> :
																												 names['long'] extends undefined ?
																													 AddLong<names, name> :
																												 	 AddAliasLong<names, name> :

	// Capture a short flag & continue
	E extends `-${infer name} ${infer tail}`            ? Checks.ShortFlagTooLong<name> extends true ? Errors.ShortFlagTooLong<name> :
																												Checks.AliasDuplicate<names, name> extends true ? Errors.AliasDuplicate<name> :
																												Checks.NameAlreadyTaken<limits, name> extends true ? Errors.NameAlreadyTaken<name> :
																												Checks.NameReserved<limits, name> extends true ? Errors.NameReserved<name> :
																												names['short'] extends undefined ?
																												 	ParseFlagNameExpressionDo<tail, limits, AddShort<names, name>> :
																												 	ParseFlagNameExpressionDo<tail, limits, AddAliasShort<names, name>> :
	// Capture a short name & Done!
	E extends `-${infer name}` 							            ? Checks.ShortFlagTooLong<name> extends true ? Errors.ShortFlagTooLong<name> :
																												Checks.AliasDuplicate<names, name> extends true ? Errors.AliasDuplicate<name> :
																												Checks.NameAlreadyTaken<limits, name> extends true ? Errors.NameAlreadyTaken<name> :
																												Checks.NameReserved<limits, name> extends true ? Errors.NameReserved<name> :
																												names['short'] extends undefined ?
																												 	AddShort<names, name> :
																												 	AddAliasShort<names, name> :

	// Capture a long flag & continue
	E extends `${infer name} ${infer tail}`             ? Checks.AliasDuplicate<names, name> extends true ? Errors.AliasDuplicate<name> :
																												Checks.NameAlreadyTaken<limits, name> extends true ? Errors.NameAlreadyTaken<name> :
																												Checks.NameReserved<limits, name> extends true ? Errors.NameReserved<name> :
																												Str.Length<name> extends 1 ?
																													names['short'] extends undefined ?
																														ParseFlagNameExpressionDo<tail, limits, AddShort<names, name>> :
																														ParseFlagNameExpressionDo<tail, limits, AddAliasShort<names, name>> :
																													names['long'] extends undefined ?
																														ParseFlagNameExpressionDo<tail, limits, AddLong<names, name>> :
																														ParseFlagNameExpressionDo<tail, limits, AddAliasLong<names, name>> :

  E extends `${infer name}`                           ? Checks.AliasDuplicate<names, name> extends true ? Errors.AliasDuplicate<name> :
																												Checks.NameAlreadyTaken<limits, name> extends true ? Errors.NameAlreadyTaken<name> :
																												Checks.NameReserved<limits, name> extends true ? Errors.NameReserved<name> :
																												Str.Length<name> extends 1 ?
																													names['short'] extends undefined ?
																														AddShort<names, name> :
																														AddAliasShort<names, name> :
																													names['long'] extends undefined ?
																														AddLong<names, name> :
																														AddAliasLong<names, name> :

	Errors.Unknown
