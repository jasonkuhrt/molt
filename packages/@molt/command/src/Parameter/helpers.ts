import type { ObjectSet } from '../lib/prelude/prelude.js'
import type { Type } from '../Type/index.js'
import type { Builder, BuilderState } from './constructors/basic.js'
import type { FlagName } from '@molt/types'
import type { Simplify } from 'type-fest'

export interface BuilderBase<S> {
  [BuilderStateSymbol]: S
}

export type Value = string | boolean | number

export const getBuilderState = <S>(builder: BuilderBase<S>): Simplify<GetBuilderState<BuilderBase<S>>> =>
  builder[BuilderStateSymbol]

export type GetBuilderState<B extends BuilderBase<any>> = B[BuilderStateSymbol]

export const BuilderStateSymbol = Symbol(`BuilderState`)

export type BuilderStateSymbol = typeof BuilderStateSymbol

export type BuilderStateMinimum = ObjectSet<BuilderState, 'name', FlagName.Types.FlagNames>

export type Infer<$Builder extends Builder> = _Infer<GetBuilderState<$Builder>>

// prettier-ignore
type _Infer<$BuilderState extends BuilderState> =
  $BuilderState extends { type: infer $Type extends Type.Type }
    ? Type.Infer<$Type>
    : never
