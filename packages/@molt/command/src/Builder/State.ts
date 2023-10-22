import type { CommandParameter } from '../CommandParameter/index.js'
import type { Values } from '../helpers.js'
import type { ExclusiveParameterConfiguration } from './exclusive/types.js'
import type { ParameterConfiguration } from './root/types.js'
import type { Name } from '@molt/types'
import type { Simplify } from 'type-fest'
import type { z } from 'zod'

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
            NameParsed: Name.Data.FlagNames
            NameUnion: string
            Schema: CommandParameter.SomeBasicType
          }
        }
      }
    }
    Parameters: {
      [nameExpression: string]: {
        NameParsed: Name.Data.FlagNames
        NameUnion: string
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
          // @ts-expect-error - Trust the name expression here...
          [_ in NameExpression as Name.Data.GetCanonicalName<Name.Parse<NameExpression>>]: {
            Schema: Configuration['schema']
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
    // Any.Compute<
      {
        [Name in keyof State['Parameters'] & string as Name.Data.GetCanonicalName<State['Parameters'][Name]['NameParsed']>]:
          z.infer<State['Parameters'][Name]['Schema']>
      } &
      // In order to make keys optional we have to do some ugly gymnastics. Would be great if there was a better way.
      // We create an inner object that could be optional or not, then stripe off the outer object which results in a
      // union of objects that we need to merge together... :(
      UnionToIntersection<Values<{
        [Label in keyof State['ParametersExclusive'] & string]:
          State['ParametersExclusive'][Label]['Optional'] extends true
          ? { [_ in Label]?:
              Simplify<Values<{
                [Name in keyof State['ParametersExclusive'][Label]['Parameters']]:
                  {
                    _tag: Name.Data.GetCanonicalName<State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']>
                    value: z.infer<State['ParametersExclusive'][Label]['Parameters'][Name]['Schema']>
                  }
              }>>
            }
          : { [_ in Label]: 
              Simplify<Values<{
                [Name in keyof State['ParametersExclusive'][Label]['Parameters']]:
                  {
                    _tag: Name.Data.GetCanonicalName<State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']>
                    value: z.infer<State['ParametersExclusive'][Label]['Parameters'][Name]['Schema']>
                  }
              }>>
            }
          
      }>>
    >

  // prettier-ignore
  export type ToSchema<Spec extends State.Base> = {
    [K in keyof Spec['Parameters'] & string as Name.Data.GetCanonicalName<Spec['Parameters'][K]['NameParsed']>]:
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
