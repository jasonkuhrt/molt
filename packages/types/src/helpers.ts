export type SomeParseError = string
export type SomeParseResult = SomeParseError | FlagNames
export type FlagName = {
  long: string | undefined
  short: string | undefined
}

export type FlagNames = FlagName & {
  aliases: {
    short: [...string[]]
    long: [...string[]]
  }
}

export type FlagNamesEmpty = {
  aliases: {
    short: []
    long: []
  }
  long: undefined
  short: undefined
}
