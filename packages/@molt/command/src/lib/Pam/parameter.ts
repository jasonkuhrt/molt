import type { Type } from '../../Type/index.js'
import type { Value } from './types.js'
import type { Name } from '@molt/types'

export interface Parameter<$Type extends Type.Type = Type.Type> {
  _tag: 'Basic'
  name: Name.Data.NameParsed
  type: $Type
  optionality: Optionality
  description: null | string
}

// prettier-ignore
export type Optionality = 
    | { _tag: 'required' }
    | { _tag: 'optional' }
    | { _tag: 'default', getValue: () => Value }
