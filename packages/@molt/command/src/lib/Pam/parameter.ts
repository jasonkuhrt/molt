import type { Name } from '@molt/name'
import type { Type } from '../../Type/index.js'

export interface Parameter<$Type extends Type.Type = Type.Type> {
  _tag: 'Basic'
  name: Name.Data.NameParsed
  type: $Type
}
