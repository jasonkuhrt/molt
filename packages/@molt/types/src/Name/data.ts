export type SomeParseError = string

export type SomeParseResult = SomeParseError | Name

export type IsParseError<T extends SomeParseResult> = T extends SomeParseError ? true : false

export type Name = {
  aliases: {
    short: [...string[]]
    long: [...string[]]
  }
  long: string | undefined
  short: string | undefined
}

export type NameEmpty = {
  aliases: {
    short: []
    long: []
  }
  long: undefined
  short: undefined
}

/**
 * Get the canonical name of the flag. If there is a long name, it will be used. Otherwise, the short name will be used.
 */
// prettier-ignore
export type GetCanonicalName<Names extends Name> =
    Names['long']  extends string ? Names['long'] :
    Names['short'] extends string ? Names['short'] :
                                    never // A valid flag always has either a long or short name

/**
 * Get the names of the flag from a successful parse result. If the parse result was a failure then an empty string is returned.
 */
// prettier-ignore
export type GetNamesFromParseResult<Names extends SomeParseResult> =
  Names extends Name ? (
                              | (Names['long']  extends undefined ? never : Names['long'])
                              | (Names['short'] extends undefined ? never : Names['short'])
                              | Names['aliases']['long'][number]
                              | Names['aliases']['short'][number]
                            )
                          : ''

/**
 * Get the canonical name of the flag from a successful parse result, or, if parsing failed, the error message.
 */
// prettier-ignore
export type GetCanonicalNameOrErrorFromParseResult<result extends SomeParseResult> = 
	result extends string    ? result :
  result extends Name ? GetCanonicalName<result> :
                             never // Impossible, all union cases handled
