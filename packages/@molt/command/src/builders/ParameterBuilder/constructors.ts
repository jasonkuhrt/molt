import type { TypeBuilder } from '../TypeBuilder/types.js'
import { create } from './chain.js'

export const name = <$Name extends string>(name: $Name) => {
  return create().name(name)
}

export const type = <$TypeBuilder extends TypeBuilder>(type: $TypeBuilder) => {
  return create().type(type)
}
