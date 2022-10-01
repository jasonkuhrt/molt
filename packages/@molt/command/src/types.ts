import type { FlagName } from '@molt/types'
import type { z } from 'zod'

export type SomeSchema = z.ZodRawShape

// prettier-ignore
export type FlagSpecExpressionParseResultToPropertyName<result extends FlagName.Types.SomeParseResult> = 
	FlagName.Errors.$Is<result> extends true 		? result :
	result extends { long: string } 						? result['long'] :
	result extends { short: string} 						? result['short'] :
																							  never
