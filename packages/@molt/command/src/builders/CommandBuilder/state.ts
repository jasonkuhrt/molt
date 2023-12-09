import type { Name } from '@molt/name'
import type { Objects, Pipe } from 'hotscript'
import type { Simplify } from 'type-fest'
import type { Values } from '../../helpers.js'
import type { HKT } from '../../helpers.js'
import type { ParameterBasicInput } from '../../Parameter/basic.js'
import type { ParameterExclusiveInput } from '../../Parameter/exclusive.js'
import type { Prompt } from '../../Parameter/types.js'
import type { Settings } from '../../Settings/index.js'
import type { Type } from '../../Type/index.js'
import type { ExclusiveParameterConfiguration } from '../ExclusiveBuilder/chain.js'
import type { ParameterBuilderInfer } from '../ParameterBuilder/chain.js'
import type { TypeBuilder } from '../TypeBuilder/types.js'
import type { PrivateData } from '../../lib/PrivateData/PrivateData.js'
import type {
  ParameterBuilderWithMinimumState,
  ParameterBuilderUpdateStateProperty,
} from '../ParameterBuilder/state.js'
import type { ParameterConfiguration } from './chain.js'

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
  export interface TypeMapper<T extends Type.Type = Type.Type>
    extends HKT.Fn<T, T> {
    return: T
  }

  export interface Initial extends Base {
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
            parameterBuilder: ParameterBuilderWithAtLeastNameAndType
            NameParsed: Name.Data.NameParsed
            NameUnion: string
            Type: Type.Type
          }
        }
      }
    }
    Parameters: {
      [nameExpression: string]: {
        parameterBuilder: ParameterBuilderWithAtLeastNameAndType
        NameParsed: Name.Data.NameParsed
        NameUnion: string
        Type: Type.Type
      }
    }
  }

  type ReservedParameterNames = 'help' | 'h'

  export type ValidateNameExpression<
    State extends Base,
    NameExpression extends string,
  > = Name.Data.IsParseError<
    Name.Parse<
      NameExpression,
      { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }
    >
  > extends true
    ? Name.Parse<
        NameExpression,
        {
          usedNames: GetUsedNames<State>
          reservedNames: ReservedParameterNames
        }
      >
    : NameExpression

  export type GetUsedNames<State extends Base> = Values<
    State['Parameters']
  >['NameUnion']

  export type ParametersConfigBase = Record<
    string,
    {
      type: ParameterConfiguration['type']
      prompt?: Prompt<any>
    }
  >

  export type SetExclusiveOptional<
    $State extends Base,
    Label extends string,
    Value extends boolean,
  > = Pipe<
    $State,
    [
      Objects.Update<
        'ParametersExclusive',
        Objects.Assign<{
          [_ in Label]: {
            Optional: Value
            Parameters: $State['ParametersExclusive'][_]['Parameters']
          }
        }>
      >,
    ]
  >

  export type SetIsPromptEnabled<
    $State extends Base,
    value extends boolean,
  > = Pipe<
    $State,
    [
      Objects.Update<
        'IsPromptEnabled',
        $State['IsPromptEnabled'] extends true ? true : value
      >,
    ]
  >

  export type ParameterBuilderWithAtLeastType =
    ParameterBuilderWithMinimumState<{
      typeBuilder: PrivateData.Values.Define<TypeBuilder>
    }>

  export type ParameterBuilderWithAtLeastNameAndType =
    ParameterBuilderWithMinimumState<{
      name: PrivateData.Values.Define<string>
      typeBuilder: PrivateData.Values.Define<TypeBuilder>
    }>

  export type ParameterBuilderRecordMinimumState =
    ParameterBuilderWithMinimumState<{
      typeBuilder: PrivateData.Values.Define<TypeBuilder>
    }>

  export type AddParameterBuilders<
    $State extends Base,
    $Builders extends Record<string, ParameterBuilderRecordMinimumState>,
  > = Pipe<
    $State,
    [
      Objects.Update<
        'Parameters',
        Objects.Assign<{
          [NameExpression in keyof $Builders &
            string]: CreateParameterFromParameterBuilder<
            $State,
            ParameterBuilderUpdateStateProperty<
              $Builders[NameExpression],
              'name',
              NameExpression
            >
          >
        }>
      >,
      // TODO bring prompt back
      // Objects.Update<
      //   'IsPromptEnabled',
      //   $State['IsPromptEnabled'] extends true
      //     ? true
      //     : IsPromptEnabledInParameterSettings<Configuration>
      // >,
    ]
  >

  export type AddParameterBuilder<
    $State extends Base,
    $Builder extends ParameterBuilderWithAtLeastNameAndType,
  > = Pipe<
    $State,
    [
      Objects.Update<
        'Parameters',
        Objects.Assign<{
          [_ in PrivateData.Get<$Builder>['name']]: CreateParameterFromParameterBuilder<
            $State,
            $Builder
          >
        }>
      >,
      // TODO bring prompt back
      // Objects.Update<
      //   'IsPromptEnabled',
      //   $State['IsPromptEnabled'] extends true
      //     ? true
      //     : IsPromptEnabledInParameterSettings<Configuration>
      // >,
    ]
  >

  export type AddExclusiveParameter<
    $State extends Base,
    Label extends string,
    NameExpression extends string,
    Configuration extends ExclusiveParameterConfiguration<$State>,
  > = Pipe<
    $State,
    [
      Objects.Update<
        'ParametersExclusive',
        Objects.Assign<
          $State['ParametersExclusive'] & {
            [_ in Label]: {
              Optional: $State['ParametersExclusive'][_]['Optional']
              Parameters: {
                [_ in NameExpression as Name.Data.GetCanonicalNameOrErrorFromParseResult<
                  Name.Parse<NameExpression>
                >]: {
                  Type: HKT.Call<$State['TypeMapper'], Configuration['type']>
                  NameParsed: Name.Parse<
                    NameExpression,
                    {
                      usedNames: GetUsedNames<$State>
                      reservedNames: ReservedParameterNames
                    }
                  >
                  NameUnion: Name.Data.GetNamesFromParseResult<
                    Name.Parse<
                      NameExpression,
                      {
                        usedNames: GetUsedNames<$State>
                        reservedNames: ReservedParameterNames
                      }
                    >
                  >
                }
              }
            }
          }
        >
      >,
    ]
  >

  export type CreateParameterFromParameterBuilder<
    $State extends Base,
    $ParameterBuilder extends ParameterBuilderWithAtLeastNameAndType,
  > = {
    parameterBuilder: $ParameterBuilder
    Type: HKT.Call<
      $State['TypeMapper'],
      PrivateData.Get<PrivateData.Get<$ParameterBuilder>['typeBuilder']>['type']
    >
    NameParsed: Name.Parse<
      PrivateData.Get<$ParameterBuilder>['name'],
      { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }
    >
    NameUnion: Name.Data.GetNamesFromParseResult<
      Name.Parse<
        PrivateData.Get<$ParameterBuilder>['name'],
        {
          usedNames: GetUsedNames<$State>
          reservedNames: ReservedParameterNames
        }
      >
    >
  }
  export type CreateParameter<
    $State extends Base,
    NameExpression extends string,
    Configuration extends ParameterConfiguration<$State>,
  > = {
    Type: HKT.Call<$State['TypeMapper'], Configuration['type']>
    NameParsed: Name.Parse<
      NameExpression,
      { usedNames: GetUsedNames<$State>; reservedNames: ReservedParameterNames }
    >
    NameUnion: Name.Data.GetNamesFromParseResult<
      Name.Parse<
        NameExpression,
        {
          usedNames: GetUsedNames<$State>
          reservedNames: ReservedParameterNames
        }
      >
    >
  }

  export type ToArgs<$State extends Base> =
    $State['IsPromptEnabled'] extends true
      ? Promise<ToArgs_<$State>>
      : ToArgs_<$State>

  type ToArgs_<$State extends Base> = Simplify<
    {
      [Name in keyof $State['Parameters'] &
        string as $State['Parameters'][Name]['NameParsed']['canonical']]: ParameterBuilderInfer<
        $State['Parameters'][Name]['parameterBuilder']
      >
    } & {
      [Label in keyof $State['ParametersExclusive'] & string]:
        | Simplify<
            Values<{
              [Name in keyof $State['ParametersExclusive'][Label]['Parameters']]: {
                _tag: $State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']['canonical']
                value: Type.Infer<
                  $State['ParametersExclusive'][Label]['Parameters'][Name]['Type']
                >
              }
            }>
          >
        | ($State['ParametersExclusive'][Label]['Optional'] extends true
            ? undefined
            : never)
    }
  >

  export type ToTypes<$State extends BuilderCommandState.Base> = {
    [K in keyof $State['Parameters'] &
      string as $State['Parameters'][K]['NameParsed']['canonical']]: $State['Parameters'][K]['Type']
  }
}
