import type { Values } from '../../helpers.js'
import type { HKT } from '../../helpers.js'
import type { Settings } from '../../index.js'
import type { ParameterBasicInput } from '../../Parameter/basic.js'
import type { ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import type { Prompt } from '../../Parameter/types.js'
import type { Type } from '../../Type/index.js'
import type { ExclusiveParameterConfiguration } from '../exclusive/types.js'
import type { IsPromptEnabledInParameterSettings, ParameterConfiguration } from './types.js'
import type { Name } from '@molt/types'
import type { Objects, Pipe } from 'hotscript'
import type { Simplify } from 'type-fest'

export const createState = (): BuilderCommandState => {
  return {
    typeMapper: (type) => type as any,
    newSettingsBuffer: [],
    settings: null,
    parameterInputs: {},
  }
}

export interface BuilderCommandState {
  typeMapper: (value: unknown) => Type.Type
  settings: null | Settings.Output
  newSettingsBuffer: Settings.Input[]
  parameterInputs: Record<string, ParameterBasicInput | ParameterExclusiveInput>
}

export namespace BuilderCommandState {
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
      prompt?: Prompt<any>
    }
  >

  // prettier-ignore
  export type SetExclusiveOptional<
    $State extends Base,
    Label extends string,
    Value extends boolean,
  > =
    Pipe<$State, [
      Objects.Update<'ParametersExclusive',
        Objects.Assign<{
          [_ in Label]: {
            Optional: Value 
            Parameters: $State['ParametersExclusive'][_]['Parameters']
          }
        }>
      >
    ]>

  export type SetIsPromptEnabled<$State extends Base, value extends boolean> = Pipe<
    $State,
    [Objects.Update<'IsPromptEnabled', $State['IsPromptEnabled'] extends true ? true : value>]
  >

  export type AddParameter<
    $State extends Base,
    NameExpression extends string,
    Configuration extends ParameterConfiguration<$State>,
  > = Pipe<
    $State,
    [
      Objects.Update<
        'Parameters',
        Objects.Assign<{
          [_ in NameExpression]: CreateParameter<$State, NameExpression, Configuration>
        }>
      >,
      Objects.Update<
        'IsPromptEnabled',
        $State['IsPromptEnabled'] extends true ? true : IsPromptEnabledInParameterSettings<Configuration>
      >,
    ]
  >

  // prettier-ignore
  export type AddExclusiveParameter<
    $State extends Base,
    Label extends string,
    NameExpression extends string,
    Configuration extends ExclusiveParameterConfiguration<$State>
  > =
    Pipe<$State, [
      Objects.Update<'ParametersExclusive',
        Objects.Assign<$State['ParametersExclusive'] & {
          [_ in Label]: {
            Optional: $State['ParametersExclusive'][_]['Optional']
            Parameters: {
              [_ in NameExpression as Name.Data.GetCanonicalNameOrErrorFromParseResult<Name.Parse<NameExpression>>]: {
                Type: HKT.Call<$State['TypeMapper'], Configuration['type']>
                NameParsed: Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>
                NameUnion: Name.Data.GetNamesFromParseResult<Name.Parse<NameExpression, { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }>>
              }

            }
          }
        }
    >>]>

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
  export type ToTypes<$State extends BuilderCommandState.Base> = {
    [K in keyof $State['Parameters'] & string as $State['Parameters'][K]['NameParsed']['canonical']]:
      $State['Parameters'][K]['Type']
  }
}
