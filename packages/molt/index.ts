import { Errors, Helpers, ParseFlagNameExpression } from '@molt/types'
import { z } from 'zod'

const as = <T>(): T => 0 as any

// prettier-ignore
type GetFlagNamesUnion<Names extends Helpers.SomeParseResult> =
	Names extends Helpers.SomeParseError
		? never
		: // @ts-ignore
			| (Names['long'] extends string ? Names['long'] : never)
		  // @ts-ignore
			| (Names['short'] extends string ? Names['short'] : never)
			// @ts-ignore
			| Names['aliases']['short'][number]
			// @ts-ignore
			| Names['aliases']['long'][number]

// prettier-ignore
interface Bam {
  // flag<T extends string>(nameSpecExpression: Errors.Is<ParseFlagNameExpression<T>> extends true ? ParseFlagNameExpression<T> : T, definition: (context:{name: Flag.GetContext<T>}) => void | Promise<void>): void
  flag<E extends string>(
    nameSpecExpression: Errors.Is<ParseFlagNameExpression<E>> extends true
      ? ParseFlagNameExpression<E>
      : E,
    definition: {}
	// @ts-ignore
  ): BamChain<GetFlagNamesUnion<ParseFlagNameExpression<E>>>
  parse<T extends object>(spec: RecordFlags<keyof T>): object
}

type RecordFlags<Names extends string | symbol | number> = {
  [Name in Names]: Name extends string
    ? Errors.Is<ParseFlagNameExpression<Name>> extends true
      ? ParseFlagNameExpression<Name>
      : z.ZodType
    : never
}

// prettier-ignore
interface BamChain<FlagNames extends string> {
	x: FlagNames
	// flag<T extends string>(nameSpecExpression: Errors.Is<ParseFlagNameExpression<T>> extends true ? ParseFlagNameExpression<T> : T, definition: (context:{name: Flag.GetContext<T>}) => void | Promise<void>): void
	flag<E extends string>(
		nameSpecExpression: Errors.Is<ParseFlagNameExpression<E, { usedNames: FlagNames, reservedNames: undefined }>> extends true ? ParseFlagNameExpression<E, { usedNames: FlagNames, reservedNames: undefined }> : E,
		definition: {
		}
	// @ts-ignore
  ): BamChain<FlagNames | GetFlagNamesUnion<ParseFlagNameExpression<E>>>
	parse(): object
}

const Bam = as<Bam>()

const input = Bam.parse({
  // @ts-expect-error
  '--a': z.string().min(1),
  '-b ': z.number().min(1),
  '-d': z.boolean(),
})

// @ts-expect-error
Bam.flag(`-ver`, z.number().min(1))
// @ts-expect-error
Bam.flag(`--v`, z.string().min(1))
Bam.flag(`--ver -v`, z.string().min(1))
  // @ts-expect-error
  .flag(`-v`, z.string().min(1))
  // @ts-expect-error
  .flag(`--ver`, z.string().min(1))
Bam.flag(`--aa -a --bb -b`, z.string().min(1))
  // @ts-expect-error
  .flag(`-b`, z.string().min(1))
  // @ts-expect-error
  .flag(`--bb`, z.string().min(1))

Bam.flag(`aa a bb b`, z.string().min(1))
  // @ts-expect-error
  .flag(`b`, z.string().min(1))
  // @ts-expect-error
  .flag(`bb`, z.string().min(1))
