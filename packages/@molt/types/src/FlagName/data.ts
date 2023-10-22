export type SomeParseError = string

export type SomeParseResult = SomeParseError | FlagNames

export interface FlagName {
  long: null | string
  short: null | string
}

export interface FlagNames extends FlagName {
  expression: string
  canonical: string
  aliases: {
    short: [...string[]]
    long: [...string[]]
  }
}

export interface FlagNamesEmpty {
  expression: string
  canonical: string
  aliases: {
    short: []
    long: []
  }
  long: null
  short: null
}

/**
 * Get the names of the flag from a successful parse result. If the parse result was a failure then an empty string is returned.
 */
// prettier-ignore
export type GetNamesFromParseResult<Names extends SomeParseResult> =
  Names extends FlagNames ? (
                              | (Names['long']  extends null ? never : Names['long'])
                              | (Names['short'] extends null ? never : Names['short'])
                              | Names['aliases']['long'][number]
                              | Names['aliases']['short'][number]
                            )
                          : ''

// /**
//  * Get the canonical name of the flag from a successful parse result, or, if parsing failed, the error message.
//  */
// // prettier-ignore
// export type GetCanonicalNameOrErrorFromParseResult<result extends SomeParseResult> =
// 	result extends string    ? result :
//   result extends FlagNames ? GetCanonicalName<result> :
//                              never // Impossible, all union cases handled
