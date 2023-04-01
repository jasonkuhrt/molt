import type { Any } from 'ts-toolbelt'

type SomePattern = Pattern<object>

type SomeData = object

type SomeDataObject = object

export type Pattern<Data extends SomeData> = boolean | PatternForDataObject<Data>

// prettier-ignore
type PatternForDataObject<Data extends SomeData> = {
		[K in keyof Data]?:
			| boolean 
			| (Data[K] extends SomeDataObject ?
					IsOrIsAny<PatternForDataObject<Data[K]>> :
					Any.Compute<IsOrIsAny<Data[K]>>
				)
	}

type IsOrIsAny<T> = T | T[]

export const checkMatches = (pattern: SomePattern | undefined, value: unknown): boolean => {
  if (Array.isArray(pattern)) {
    return pattern.some((_) => checkMatches(_, value))
  }

  if (pattern === undefined) {
    return false
  }

  if (typeof pattern === `object` && pattern !== null) {
    if (!(typeof value === `object` && value !== null)) {
      return false
    }
    const valuePatterns = Object.entries(pattern)
    if (valuePatterns.length === 0) {
      return false
    }
    return valuePatterns
      .map(([key, valuePattern]) => {
        if (!(key in value)) {
          return false
        }
        return checkMatches(valuePattern, (value as any)[key])
      })
      .reduce((all, next) => all && next, true)
  }

  if (pattern === true) {
    return true
  }

  return pattern === value
}
