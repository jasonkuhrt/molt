import type { $, Objects } from 'hotscript'
import { createUpdater } from '../../../helpers.js'
import type { Type } from '../../../Type/index.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'

export type TypeStringBuilder<$State extends State.Base = State.Base> =
  PrivateData.Set<
    $State,
    {
      toCase: <$CaseType extends 'upper' | 'lower'>(
        caseType: $CaseType,
      ) => TypeStringBuilder<
        $<Objects.Update<'transformations.toCase', $CaseType>, $State>
      >
      trim: <$P extends [] | [enabled: boolean]>(
        ...args: $P
      ) => TypeStringBuilder<
        $<
          Objects.Update<
            'transformations.trim',
            $P[0] extends undefined ? true : $P[0]
          >,
          $State
        >
      >
      min: <$Value extends number>(
        value: $Value,
      ) => TypeStringBuilder<
        $<Objects.Update<'refinements.min', $Value>, $State>
      >
      max: <$Value extends number>(
        value: $Value,
      ) => TypeStringBuilder<
        $<Objects.Update<'refinements.max', $Value>, $State>
      >
      length: <$Value extends number>(
        value: $Value,
      ) => TypeStringBuilder<
        $<Objects.Update<'refinements.length', $Value>, $State>
      >
      startsWith: <$Value extends string>(
        value: $Value,
      ) => TypeStringBuilder<
        $<Objects.Update<'refinements.startsWith', $Value>, $State>
      >
      endsWith: <$Value extends string>(
        value: $Value,
      ) => TypeStringBuilder<
        $<Objects.Update<'refinements.endsWith', $Value>, $State>
      >
      includes: <$Value extends string>(
        value: $Value,
      ) => TypeStringBuilder<
        $<Objects.Update<'refinements.includes', $Value>, $State>
      >
      regex: <$Value extends RegExp>(
        value: $Value,
      ) => TypeStringBuilder<
        $<Objects.Update<'refinements.regex', $Value>, $State>
      >
      pattern: <$Args extends Pattern>(
        ...args: $Args
      ) => TypeStringBuilder<
        $<
          Objects.Update<
            'refinements.pattern',
            $Args[1] extends object
              ? { type: $Args[0] } | { type: $Args[0]; options: $Args[1] }
              : { type: $Args[0] }
          >,
          $State
        >
      >
    }
  >

type Pattern =
  | [pattern: 'email']
  | [pattern: 'url']
  | [pattern: 'uuid']
  | [pattern: 'cuid']
  | [pattern: 'cuid2']
  | [pattern: 'ulid']
  | [pattern: 'emoji']
  | [pattern: 'ip', options: { version: 4 | 6 | null }]
  | [
      pattern: 'dateTime',
      options: { offset: boolean; precision: null | number },
    ]

namespace State {
  export interface Base {
    type: Type.String
    transformations: {
      trim?: boolean
      toCase?: 'upper' | 'lower'
    }
    refinements: {
      min?: number
      max?: number
      length?: number
      startsWith?: string
      endsWith?: string
      includes?: string
      regex?: RegExp
      pattern?: Pattern
    }
  }
  export interface Initial {
    type: Type.String
    transformations: {} // eslint-disable-line
    refinements: {} // eslint-disable-line
  }
  export const initial: Initial = {
    type: null as any, // eslint-disable-line
    transformations: {},
    refinements: {},
  }
}

export const create = (): TypeStringBuilder<State.Base> =>
  create_(State.initial) as any

const create_ = (state: State.Base): TypeStringBuilder => {
  const update = createUpdater({ builder: create_, state })

  return PrivateData.set(state, {
    toCase: update(`transformations.toCase`) as any, // eslint-disable-line
    // eslint-disable-next-line
    trim: update<[] | [boolean]>(`transformations.trim`, (...args) => {
      return args.length === 0 ? true : args[0]
    }) as any,
    min: update(`refinements.min`) as any, // eslint-disable-line
    max: update(`refinements.max`) as any, // eslint-disable-line
    length: update(`refinements.length`) as any, // eslint-disable-line
    endsWith: update(`refinements.endsWith`) as any, // eslint-disable-line
    startsWith: update(`refinements.startsWith`) as any, // eslint-disable-line
    includes: update(`refinements.includes`) as any, // eslint-disable-line
    regex: update(`refinements.regex`) as any, // eslint-disable-line
    pattern: update<Pattern>(`refinements.pattern`, (...args) => args) as any, // eslint-disable-line
  } satisfies PrivateData.Remove<TypeStringBuilder>)
}

export { create as string }
