import type { Name } from './data.js'
import type { SomeLimits } from './parser.js'
import type { $, Strings } from 'hotscript'

// prettier-ignore
export namespace Messages {
  export type WithHeader<Body extends string> = `Error(s):\n${Body}`
  export type LongTooShort<Variant extends string> =
    `A long flag must be two (2) or more characters but you have: '--${Variant}'.`
  export type AliasDuplicate<Variant extends string> = `Your alias "${Variant}" is a duplicate.`
  export type ShortTooLong<Variant extends string> =
    `A short flag must be exactly one (1) character but you have: '-${Variant}'.`
  export type AlreadyTaken<Variant extends string> =
    `The name "${Variant}" cannot be used because it is already used for another flag.`
  export type Reserved<Variant extends string> = `The name "${Variant}" cannot be used because it is reserved.`
}

// prettier-ignore
export namespace Kinds {
  export type LongTooShort<Variant extends string> = {
    predicate: $<Strings.Length, Variant> extends 1 ? true : false
    message: Messages.LongTooShort<Variant>
  }

  export type ShortTooLong<Variant extends string> = {
    predicate: $<Strings.Length, Variant> extends 1 ? false : true
    message: Messages.ShortTooLong<Variant>
  }

  export type AliasDuplicate<$Name extends Name, Variant extends string> = {
    predicate: $<Strings.CamelCase, Variant> extends $Name['long'] | $Name['short'] ? true : false
    message: Messages.AliasDuplicate<Variant>
  }

  export type AlreadyTaken<Limits extends SomeLimits, Variant extends string> = {
    predicate: Limits['usedNames'] extends undefined ? false
      : $<Strings.CamelCase, Variant> extends $<Strings.CamelCase, Exclude<Limits['usedNames'], undefined>> ? true
      : false
    message: Messages.AlreadyTaken<Variant>
  }

  export type Reserved<Limits extends SomeLimits, Variant extends string> = {
    predicate: Limits['reservedNames'] extends undefined ? false
      : $<Strings.CamelCase, Variant> extends $<Strings.CamelCase, Exclude<Limits['reservedNames'], undefined>> ? true
      : false
    message: Messages.Reserved<Variant>
  }
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

export interface Result {
  predicate: boolean
  message: string
}

export type SomeFailures = [Result, ...Result[]]

// prettier-ignore
export type ReportFailures<Results extends [...Result[]], Accumulator extends string = ''> = Results extends
  [infer Head extends Result, ...infer Tail extends Result[]]
  ? Head['predicate'] extends true ? Accumulator extends '' ? ReportFailures<Tail, Messages.WithHeader<Head['message']>>
    : ReportFailures<Tail, `${Accumulator}\n${Head['message']}`>
  : ReportFailures<Tail, Accumulator>
  : Accumulator

// prettier-ignore
type FilterFailures<Results extends [...Result[]], Accumulator extends Result[] = []> = Results extends
  [infer Head extends Result, ...infer Tail extends Result[]]
  ? Head['predicate'] extends true ? FilterFailures<Tail, [...Accumulator, Head]>
  : FilterFailures<Tail, Accumulator>
  : Accumulator
