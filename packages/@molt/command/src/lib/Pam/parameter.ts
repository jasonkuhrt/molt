import type { Type } from '../../Type/index.js'
import type { Name } from '@molt/types'

export interface Parameter<$Type extends Type.Type = Type.Type> {
  _tag: 'Basic'
  name: Name.Data.NameParsed
  type: $Type
}
