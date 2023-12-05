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
  const refinement = (name: string) => {
    return update(`refinements.${name}`) as any
  }
  const transformation = (name: string) => {
    return update(`transformations.${name}`) as any
  }

  return PrivateData.set(state, {
    toCase: transformation(`toCase`), // eslint-disable-line
    trim: (...args) => {
      const value = args.length === 0 ? true : args[0]
      return transformation(`trim`)(value) // eslint-disable-line
    },
    min: refinement(`min`), // eslint-disable-line
    max: refinement(`max`), // eslint-disable-line
    length: refinement(`length`), // eslint-disable-line
    endsWith: refinement(`endsWith`), // eslint-disable-line
    startsWith: refinement(`startsWith`), // eslint-disable-line
    includes: refinement(`includes`), // eslint-disable-line
    regex: refinement(`regex`), // eslint-disable-line
    pattern: (...args) => {
      const value = args
      return refinement(`pattern`)(value) // eslint-disable-line
    },
  } satisfies PrivateData.Remove<TypeStringBuilder>)
}

export { create as string }
