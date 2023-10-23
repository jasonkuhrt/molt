// prettier-ignore
export namespace Strings {
	export type Length<S extends string, Accumulator extends (1)[] = []> = 
		S extends `${string}${infer Rest}` ? 	Length<Rest, [...Accumulator, 1]> :
																					Accumulator['length']

	// prettier-ignore
	export type KebabToCamelCase<S extends string> =
		S extends `${infer P1}-${infer P2}${infer P3}`
			? `${P1}${Uppercase<P2>}${KebabToCamelCase<P3>}`
			: S

	export type SnakeToCamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${SnakeToCamelCase<P3>}`
    : Lowercase<S>
}

export const partition = <T>(list: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const pass: T[] = []
  const fail: T[] = []

  for (const item of list) {
    if (predicate(item)) {
      pass.push(item)
    } else {
      fail.push(item)
    }
  }

  return [pass, fail]
}

export const stripeDashPrefix = (string: string): string => {
  return string.replace(/^-+/, ``)
}
