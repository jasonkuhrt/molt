import type { Any } from 'ts-toolbelt'

export const _ = `*`

// type SomePattern = Pattern<SomeData>

export type SomeData = SomeDataObject | SomeDataScalar

type SomeDataObject = object

type SomeDataScalar = number | string | boolean | null

// prettier-ignore
export type Pattern<Data extends SomeData> =
	IsOrIsAny<
		Data extends SomeDataScalar ?
			Data :
			PatternForDataObject<Data>
	>

// prettier-ignore
type PatternForDataObject<Data extends SomeData> = {
		[K in keyof Data]?:
			Data[K] extends SomeDataObject ?
				IsOrIsAny<PatternForDataObject<Data[K]>> :
				Any.Compute<IsOrIsAny<Data[K]>>
	}

// prettier-ignore
type IsOrIsAny<T> =
	// T extends true 			? true :
	// T extends null 			? null :
	// T extends false 		? false :
	// T extends boolean 	? boolean :
												(T | [T, T, ...T[]])

export const match = <D extends SomeData, P extends Pattern<D> | undefined>(data: D, pattern: P): boolean => {
  if (pattern === _) {
    return true
  }

  if (Array.isArray(pattern)) {
    return pattern.some((_) => match(data, _))
  }

  const patternType = typeof pattern

  if (patternType === `undefined` || patternType === `function`) {
    return false
  }

  if (typeof pattern === `object` && pattern !== null) {
    if (!(typeof data === `object` && data !== null)) {
      return false
    }
    const valuePatterns = Object.entries(pattern)
    if (valuePatterns.length === 0) {
      return true
    }
    return valuePatterns
      .map(([key, valuePattern]) => {
        if (!(key in data)) {
          return false
        }
        return match((data as any)[key], valuePattern)
      })
      .reduce((all, next) => all && next, true)
  }

  return pattern === (data as boolean)
}
