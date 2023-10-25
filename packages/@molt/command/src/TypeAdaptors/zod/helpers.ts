import type { SomeType } from './types.js'
import { type FromZod, fromZod } from './zod.js'
import { z } from 'zod'

export const analyzeZodType = (zodType: SomeType) => {
  return _analyzeZodType(zodType, zodType.description ?? null)
}

const _analyzeZodType = <ZT extends SomeType>(
  zt: ZT,
  description: null | string,
): {
  type: FromZod<ZT>
  description: null | string
} => {
  if (zt._def.typeName === z.ZodFirstPartyTypeKind.ZodDefault) {
    return _analyzeZodType(zt._def.innerType as ZT, description)
  }

  if (zt._def.typeName === z.ZodFirstPartyTypeKind.ZodOptional) {
    return _analyzeZodType(zt._def.innerType as ZT, description)
  }

  const type = fromZod(zt)

  return {
    description,
    type: type as FromZod<ZT>,
  }
}

// export const analyzeZodUnionType = (zodType: SomeUnionTypeScalar) => {
//   return {
//     _tag: `TypeUnion` as const,
//     members: zodType._def.options.map((_) => {
//       return analyzeZodType(_)
//       // const typeAnalysis = analyzeZodType(_)
//       // return {
//       //   // zodType: _,
//       //   description: typeAnalysis.description,
//       //   type: typeAnalysis.type,
//       // }
//     }),
//   }
// }
