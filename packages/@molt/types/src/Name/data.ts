export type SomeParseError = string

export type SomeParseResult = SomeParseError | Name

export type IsParseError<T extends SomeParseResult> = T extends SomeParseError ? true : false

export type Name = {
  expression: string
  canonical: string | null
  aliases: {
    short: [...string[]]
    long: [...string[]]
  }
  long: string | null
  short: string | null
}

export type NameEmpty = {
  expression: string
  canonical: null
  aliases: {
    short: []
    long: []
  }
  long: null
  short: null
}

export type NameParsed = {
  expression: string
  canonical: string
  aliases: {
    short: string[]
    long: string[]
  }
  long: string | null
  short: string | null
}

/**
 * Get the names of the flag from a successful parse result. If the parse result was a failure then an empty string is returned.
 */
// prettier-ignore
export type GetNamesFromParseResult<Names extends SomeParseResult> = Names extends Name ? (
    | (Names['long'] extends undefined ? never : Names['long'])
    | (Names['short'] extends undefined ? never : Names['short'])
    | Names['aliases']['long'][number]
    | Names['aliases']['short'][number]
  )
  : ''

/**
 * Get the canonical name of the flag from a successful parse result, or, if parsing failed, the error message.
 */
// prettier-ignore
export type GetCanonicalNameOrErrorFromParseResult<result extends SomeParseResult> = result extends string ? result
  : result extends Name ? result['canonical']
  : never // Impossible, all union cases handled
