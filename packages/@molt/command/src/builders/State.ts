import type { Values } from '../helpers.js'
import type { HKT } from '../helpers.js'
import type { ParameterInput } from '../ParameterInput/index.js'
import type { Type } from '../Type/index.js'
import type { ExclusiveParameterConfiguration } from './exclusive/types.js'
import type { ParameterConfiguration } from './root/types.js'
import type { Name } from '@molt/types'
import type { Simplify } from 'type-fest'

export namespace State {
  export interface TypeMapper<T extends Type.Type = Type.Type> extends HKT.Fn<T, T> {
    return: T
  }

  export interface BaseEmpty extends Base {
    IsPromptEnabled: false
    ParametersExclusive: {} // eslint-disable-line
    Parameters: {} // eslint-disable-line
    Type: Type.Type
    TypeMapper: HKT.IDFn<Type.Type<unknown>>
  }

  export type Base = {
    IsPromptEnabled: boolean
    Type: Type.Type
    TypeMapper: HKT.Fn<unknown, Type.Type<unknown>>
    ParametersExclusive: {
      [label: string]: {
        Optional: boolean
        Parameters: {
          [canonicalName: string]: {
            NameParsed: Name.Data.NameParsed
            NameUnion: string
            Type: Type.Type
          }
        }
      }
    }
    Parameters: {
      [nameExpression: string]: {
        NameParsed: Name.Data.NameParsed
        NameUnion: string
        Type: Type.Type
      }
    }
  }

  type ReservedParameterNames = 'help' | 'h'

  // prettier-ignore
  export type ValidateNameExpression<State extends Base, NameExpression extends string> = 
    Name.Data.IsParseError<Name.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>> extends true
        ? Name.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
        : NameExpression

  export type GetUsedNames<State extends Base> = Values<State['Parameters']>['NameUnion']

  export type ParametersConfigBase = Record<
    string,
    {
      type: ParameterConfiguration['type']
      prompt?: ParameterInput.Prompt<any>
    }
  >

  // prettier-ignore
  export type SetExclusiveOptional<
    State extends Base,
    Label extends string,
    Value extends boolean,
  > = {
    IsPromptEnabled: State['IsPromptEnabled']
    Parameters: State['Parameters']
    Type: State['Type']
    TypeMapper: State['TypeMapper']
    ParametersExclusive: Omit<State['ParametersExclusive'], Label> & 
      {
        [_ in Label]: {
          Optional: Value 
          Parameters: State['ParametersExclusive'][_]['Parameters']
        }
      }

  }
  // prettier-ignore
  export type AddExclusiveParameter<
    $State extends Base,
    Label extends string,
    NameExpression extends string,
    Configuration extends ExclusiveParameterConfiguration<$State>
  > =
    MergeIntoProperty<$State, 'ParametersExclusive', {
      [_ in Label]: {
        Optional: $State['ParametersExclusive'][_]['Optional']
        Parameters: {
          [_ in NameExpression as Name.Data.GetCanonicalNameOrErrorFromParseResult<Name.Parse<NameExpression>>]: {
            Type: HKT.Call<$State['TypeMapper'], Configuration['type']>
            NameParsed: Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
            NameUnion: Name.Data.GetNamesFromParseResult<
              Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
            >
          }

        }
      }
    }>

  // prettier-ignore
  export type CreateParameter<
    $State          extends Base,
    NameExpression  extends string,
    Configuration   extends ParameterConfiguration<$State>,
  > = {
    Type: HKT.Call<$State['TypeMapper'], Configuration['type']>
    NameParsed: Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
    NameUnion: Name.Data.GetNamesFromParseResult<Name.Parse<NameExpression,{ usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>>
  }

  // prettier-ignore
  export type ToArgs<$State extends Base> =
    $State['IsPromptEnabled'] extends true
      ? Promise<ToArgs_<$State>>
      : ToArgs_<$State>

  // prettier-ignore
  type ToArgs_<$State extends Base> =
    Simplify<
      {
        [Name in keyof $State['Parameters'] & string as $State['Parameters'][Name]['NameParsed']['canonical']]:
          Type.Infer<$State['Parameters'][Name]['Type']>
      } &
      {
        [Label in keyof $State['ParametersExclusive'] & string]:
          | Simplify<Values<{
              [Name in keyof $State['ParametersExclusive'][Label]['Parameters']]:
                {
                  _tag: $State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']['canonical']
                  value: Type.Infer<$State['ParametersExclusive'][Label]['Parameters'][Name]['Type']>
                }
            }>>
          | ($State['ParametersExclusive'][Label]['Optional'] extends true ? undefined : never)
      }
    >

  // prettier-ignore
  export type ToParametersToTypes<$State extends State.Base> = {
    [K in keyof $State['Parameters'] & string as $State['Parameters'][K]['NameParsed']['canonical']]:
      $State['Parameters'][K]['Type']
  }
}

/**
 * @see https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
 */
// eslint-disable-next-line
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

type SetProperty<Obj extends object, PropertyName extends keyof Obj, Value> = Omit<Obj, PropertyName> & {
  [P in PropertyName]: Value
}

type MergeIntoProperty<Obj extends object, PropertyName extends keyof Obj, Value> = SetProperty<
  Obj,
  PropertyName,
  Obj[PropertyName] & Value
>
