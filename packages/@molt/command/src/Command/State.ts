import type { CommandParameter } from '../CommandParameter/index.js'
import type { Values } from '../helpers.js'
import type { Type } from '../Type/index.js'
import type { TypeAdaptors } from '../TypeAdaptors/index.js'
import type { ExclusiveParameterConfiguration } from './exclusive/types.js'
import type { ParameterConfiguration } from './root/types.js'
import type { Name } from '@molt/types'
import type { Simplify } from 'type-fest'

export namespace State {
  export interface BaseEmpty extends Base {
    IsPromptEnabled: false
    ParametersExclusive: {} // eslint-disable-line
    Parameters: {} // eslint-disable-line
  }

  export type Base = {
    IsPromptEnabled: boolean
    ParametersExclusive: {
      [label: string]: {
        Optional: boolean
        Parameters: {
          [canonicalName: string]: {
            NameParsed: Name.Data.NameParsed
            NameUnion: string
            Type: Type.Type
            Schema: CommandParameter.SomeBasicType
          }
        }
      }
    }
    Parameters: {
      [nameExpression: string]: {
        NameParsed: Name.Data.NameParsed
        NameUnion: string
        Type: Type.Type
        Schema: CommandParameter.SomeBasicType
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

  // // prettier-ignore
  // export type AddParameter<
  //   State extends Base,
  //   NameExpression extends string,
  //   Configuration extends ParameterConfiguration
  // > =
  //   Omit<State, 'Parameters'> & {
  //     Parameters:  State['Parameters'] & { [_ in NameExpression]: CreateParameter<State,NameExpression,Configuration> }
  //   }

  export type ParametersSchemaObjectBase = Record<string, ParameterConfiguration['schema']>

  export type ParametersConfigBase = Record<
    string,
    {
      schema: ParameterConfiguration['schema']
      prompt?: CommandParameter.Input.Prompt<any>
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
    State extends Base,
    Label extends string,
    NameExpression extends string,
    Configuration extends ExclusiveParameterConfiguration
  > =
    MergeIntoProperty<State, 'ParametersExclusive', {
      [_ in Label]: {
        Optional: State['ParametersExclusive'][_]['Optional']
        Parameters: {
          [_ in NameExpression as Name.Data.GetCanonicalNameOrErrorFromParseResult<Name.Parse<NameExpression>>]: {
            Schema: Configuration['schema']
            Type: TypeAdaptors.Zod.FromZod<Configuration['schema']>
            NameParsed: Name.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
            NameUnion: Name.Data.GetNamesFromParseResult<
              Name.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
            >
          }

        }
      }
    }>

  // prettier-ignore
  export type CreateParameter<
    State           extends Base,
    NameExpression  extends string,
    Configuration   extends ParameterConfiguration,
  > = {
    Schema: Configuration['schema']
    Type: TypeAdaptors.Zod.FromZod<Configuration['schema']>
    NameParsed: Name.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
    NameUnion: Name.Data.GetNamesFromParseResult<Name.Parse<NameExpression,{ usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>>
  }

  // prettier-ignore
  export type ToArgs<State extends Base> =
    State['IsPromptEnabled'] extends true
      ? Promise<ToArgs_<State>>
      : ToArgs_<State>

  // prettier-ignore
  type ToArgs_<State extends Base> =
    Simplify<
      {
        [Name in keyof State['Parameters'] & string as State['Parameters'][Name]['NameParsed']['canonical']]:
          Type.Infer<State['Parameters'][Name]['Type']>
      } &
      {
        [Label in keyof State['ParametersExclusive'] & string]:
           | Simplify<Values<{
                [Name in keyof State['ParametersExclusive'][Label]['Parameters']]:
                  {
                    _tag: State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']['canonical']
                    value: Type.Infer<State['ParametersExclusive'][Label]['Parameters'][Name]['Type']>
                  }
              }>>
            | (State['ParametersExclusive'][Label]['Optional'] extends true ? undefined : never)
      }
    >

  // prettier-ignore
  export type ToSchema<Spec extends State.Base> = {
    [K in keyof Spec['Parameters'] & string as Spec['Parameters'][K]['NameParsed']['canonical']]:
      Spec['Parameters'][K]['Schema']
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
