// /* eslint-disable */
// import { FlagName } from '@molt/types'
// import { z } from 'zod'

// const as = <T>(): T => 0 as any

// // prettier-ignore
// type GetFlagNamesUnion<Names extends FlagName.Types.SomeParseResult> =
// 	Names extends FlagName.Types.SomeParseError
// 		? never
// 		: // @ts-ignore
// 			| (Names['long'] extends string ? Names['long'] : never)
// 		  // @ts-ignore
// 			| (Names['short'] extends string ? Names['short'] : never)
// 			// @ts-ignore
// 			| Names['aliases']['short'][number]
// 			// @ts-ignore
// 			| Names['aliases']['long'][number]

// // prettier-ignore
// interface Molt {
//   // flag<T extends string>(nameSpecExpression: FlagName.Errors.Is<FlagName.ParseFlagNameExpression<T>> extends true ? ParseFlagNameExpression<T> : T, definition: (context:{name: Flag.GetContext<T>}) => void | Promise<void>): void
//   flag<E extends string>(
//     nameSpecExpression: FlagName.Errors.$Is<FlagName.Parse<E>> extends true
//       ? FlagName.Parse<E>
//       : E,
//     definition: {}
// 	// @ts-ignore
//   ): MoltChain<GetFlagNamesUnion<FlagName.Parse<E>>>
//   parse<T extends object>(spec: RecordFlags<keyof T>): object
// }

// type RecordFlags<Names extends string | symbol | number> = {
//   [Name in Names]: Name extends string
//     ? FlagName.Errors.$Is<FlagName.Parse<Name>> extends true
//       ? FlagName.Parse<Name>
//       : z.ZodType
//     : never
// }

// // prettier-ignore
// interface MoltChain<FlagNames extends string> {
// 	x: FlagNames
// 	// flag<T extends string>(nameSpecExpression: FlagName.Errors.Is<FlagName.ParseFlagNameExpression<T>> extends true ? ParseFlagNameExpression<T> : T, definition: (context:{name: Flag.GetContext<T>}) => void | Promise<void>): void
// 	flag<E extends string>(
// 		nameSpecExpression: FlagName.Errors.$Is<FlagName.Parse<E, { usedNames: FlagNames, reservedNames: undefined }>> extends true ? FlagName.Parse<E, { usedNames: FlagNames, reservedNames: undefined }> : E,
// 		definition: {
// 		}
// 	// @ts-ignore
//   ): MoltChain<FlagNames | GetFlagNamesUnion<FlagName.Parse<E>>>
// 	parse(): object
// }

// const Molt = as<Molt>()

// const input = Molt.parse({
//   // @ts-expect-error
//   '--a': z.string().min(1),
//   '-b ': z.number().min(1),
//   '-d -x': z.boolean().describe('x'),
//   '-x': z.boolean(),
// })

// // @ts-expect-error
// Molt.flag(`-ver`, z.number().min(1))
// // @ts-expect-error
// Molt.flag(`--v`, z.string().min(1))
// Molt.flag(`--ver -v`, z.string().min(1))
//   // @ts-expect-error
//   .flag(`-v`, z.string().min(1))
//   // @ts-expect-error
//   .flag(`--ver`, z.string().min(1))
// Molt.flag(`--aa -a --bb -b`, z.string().min(1))
//   // @ts-expect-error
//   .flag(`-b`, z.string().min(1))
//   // @ts-expect-error
//   .flag(`--bb`, z.string().min(1))

// Molt.flag(`aa a bb b`, z.string().min(1))
//   // @ts-expect-error
//   .flag(`b`, z.string().min(1))
//   // @ts-expect-error
//   .flag(`bb`, z.string().min(1))
