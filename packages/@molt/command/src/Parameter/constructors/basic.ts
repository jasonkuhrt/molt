import type { ObjectSet } from '../../lib/prelude/prelude.js'
import type { Type } from '../../Type/index.js'
import type { Value } from '../helpers.js'
import { type BuilderBase, BuilderStateSymbol } from '../helpers.js'
import { Name } from '../name/index.js'
import type {
  Optionality,
  OptionalityDefault,
  OptionalityOptional,
  OptionalityRequired,
} from '../Optionality.js'
import type { FlagName } from '@molt/types'

export interface BuilderStateInitial {
  name?: FlagName.Data.FlagNames
  description?: string
  type: Type.String
  optionality?: OptionalityRequired
  prompt?: any // todo
  environment?: any // todo
}

export interface BuilderState {
  name?: FlagName.Data.FlagNames
  description?: string
  type?: Type.Type
  optionality?: Optionality
  prompt?: any // todo
  environment?: any // todo
}

// prettier-ignore
export interface Builder<$BuilderState extends BuilderState = BuilderStateInitial> extends BuilderBase<$BuilderState> {
  name<$Name extends string>          (value: Name.ValidateExpression<$Name>)   : Builder<ObjectSet<$BuilderState, 'name', Name.Name<$Name>>>
  description                         (value: string)                           : Builder<ObjectSet<$BuilderState, 'description', string>>
  optional                            ()                                        : Builder<ObjectSet<$BuilderState, 'optionality', OptionalityOptional>>
  required                            ()                                        : Builder<ObjectSet<$BuilderState, 'optionality', OptionalityRequired>>
  default                             <$Value extends Value>(value: $Value)     : Builder<ObjectSet<$BuilderState, 'optionality', OptionalityDefault<$Value>>>
  type<$Type extends Type.Type>       (type: $Type)                             : Builder<ObjectSet<$BuilderState, 'type', $Type>>
  [BuilderStateSymbol]: $BuilderState
}

export const basic = () => _basic()

const _basic = <$BuilderState extends BuilderState = BuilderStateInitial>(
  s?: $BuilderState,
): Builder<$BuilderState> => {
  const b: Builder<$BuilderState> = {
    name: (value) => {
      const name = Name.parseExpression(value)
      return _basic({
        ...b[BuilderStateSymbol],
        name: name as any, // eslint-disable-line
      })
    },
    default: (value) => {
      return _basic({
        ...b[BuilderStateSymbol],
        optionality: {
          _tag: `Default`,
          value: () => value,
        },
      })
    },
    optional: () => {
      return _basic({
        ...b[BuilderStateSymbol],
        optionality: {
          _tag: `Optional`,
        },
      })
    },
    required: () => {
      return _basic({
        ...b[BuilderStateSymbol],
        optionality: {
          _tag: `Required`,
        },
      })
    },
    description: (value) => {
      return _basic({
        ...b[BuilderStateSymbol],
        description: value,
      })
    },
    type: (type) => {
      return _basic({
        ...b[BuilderStateSymbol],
        type: type,
      })
    },
    [BuilderStateSymbol]: s ?? ({} as $BuilderState),
  }
  return b
}
