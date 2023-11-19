import type { HKT } from './helpers.js'
import { runtimeIgnore } from './Type/helpers.js'

export type SomeExtension = Extension<any, HKT.Fn<any, any>>

export interface Extension<$Type, $TypeMapper extends HKT.Fn<$Type, unknown>> {
  types: {
    type: $Type
    typeMapper: $TypeMapper
  }
  name: string
  typeMapper: (type: $Type) => HKT.Call<$TypeMapper, $Type>
}

export const createExtension = <$Type extends unknown, $TypeMapper extends HKT.Fn<$Type, unknown>>(params: {
  name: string
  type: (type: $Type) => HKT.Call<$TypeMapper, $Type>
}): Extension<$Type, $TypeMapper> => {
  return {
    name: params.name,
    typeMapper: params.type,
    types: {
      type: runtimeIgnore as $Type,
      typeMapper: runtimeIgnore as $TypeMapper,
    },
  }
}
