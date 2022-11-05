import type { Values } from '../helpers.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { FlagName } from '@molt/types'
import type { Any } from 'ts-toolbelt'
import type { z } from 'zod'

export namespace State {
  export type BaseEmpty = {
    ParametersExclusive: {} // eslint-disable-line
    Parameters: {} // eslint-disable-line
  }

  export type Base = {
    ParametersExclusive: {
      [label: string]: {
        Optional: boolean
        Parameters: {
          [nameExpression: string]: {
            NameParsed: FlagName.Types.FlagNames
            NameUnion: string
            Schema: ParameterSpec.SomeBasicZodType
          }
        }
      }
    }
    Parameters: {
      [nameExpression: string]: {
        NameParsed: FlagName.Types.FlagNames
        NameUnion: string
        Schema: ParameterSpec.SomeBasicZodType
      }
    }
  }

  type ReservedParameterNames = 'help' | 'h'

  // prettier-ignore
  export type ValidateNameExpression<State extends Base, NameExpression extends string> = 
    FlagName.Errors.$Is<FlagName.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>> extends true
        ? FlagName.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
        : NameExpression

  export type GetUsedNames<State extends Base> = Values<State['Parameters']>['NameUnion']

  // prettier-ignore
  export type AddParameter<State extends Base, NameExpression extends string, Type extends ParameterSpec.SomeBasicZodType> =
    Omit<State, 'Parameters'> & {
      Parameters:  State['Parameters'] & { [_ in NameExpression]: CreateParameter<State,NameExpression,Type> }
    }

  export type ParametersObjectBase = z.ZodRawShape

  // prettier-ignore
  export type AddParametersObject<State extends Base, ParametersObject extends ParametersObjectBase> =
    Omit<State, 'Parameters'> & {
      Parameters: State['Parameters'] & { [NameExpression in keyof ParametersObject & string]: CreateParameter<State,NameExpression,ParametersObject[NameExpression]> }
    }

  // prettier-ignore
  export type SetExclusiveOptional<
    State extends Base,
    Label extends string,
  > = {
    Parameters: State['Parameters']
    ParametersExclusive: Omit<State['ParametersExclusive'], Label> & 
      {
        [_ in Label]: {
          Optional: true 
          Parameters: State['ParametersExclusive'][_]['Parameters']
        }
      }
  }
  // prettier-ignore
  export type AddExclusiveParameter<
    State extends Base,
    Label extends string,
    NameExpression extends string,
    Type extends ParameterSpec.SomeBasicZodType
  > = {
    Parameters: State['Parameters']
    ParametersExclusive: State['ParametersExclusive'] & 
      {
        [_ in Label]: {
          Optional: State['ParametersExclusive'][_]['Optional']
          Parameters: {
            [_ in NameExpression]: {
              Schema: Type
              NameParsed: FlagName.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
              NameUnion: FlagName.Data.GetNamesFromParseResult<
                FlagName.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
              >
            }

          }
        }
      }
  }

  // prettier-ignore
  type CreateParameter<State extends Base, NameExpression extends string, Type extends ParameterSpec.SomeBasicZodType> = {
    Schema: Type
    NameParsed: FlagName.Parse<NameExpression, { usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>
    NameUnion: FlagName.Data.GetNamesFromParseResult<FlagName.Parse<NameExpression,{ usedNames: GetUsedNames<State>; reservedNames: ReservedParameterNames }>>
  }

  // prettier-ignore
  export type ToArgs<State extends Base> =
    Any.Compute<
      {
        [Name in keyof State['Parameters'] & string as FlagName.Data.GetCanonicalName<State['Parameters'][Name]['NameParsed']>]:
          z.infer<State['Parameters'][Name]['Schema']>
      } &
      // In order to make keys optional we have to do some ugly gymnastics. Would be great if there was a better way.
      // We create an inner object that could be optional or not, then stripe off the outer object which results in a
      // union of objects that we need to merge together... :(
      UnionToIntersection<Values<{
        [Label in keyof State['ParametersExclusive'] & string]:
          State['ParametersExclusive'][Label]['Optional'] extends true
          ? { [_ in Label]?:
              Values<{
                [Name in keyof State['ParametersExclusive'][Label]['Parameters']]:
                  {
                    _tag: FlagName.Data.GetCanonicalName<State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']>
                    value: z.infer<State['ParametersExclusive'][Label]['Parameters'][Name]['Schema']>
                  }
              }>
            }
          : { [_ in Label]: 
              Values<{
                [Name in keyof State['ParametersExclusive'][Label]['Parameters']]:
                  {
                    _tag: FlagName.Data.GetCanonicalName<State['ParametersExclusive'][Label]['Parameters'][Name]['NameParsed']>
                    value: z.infer<State['ParametersExclusive'][Label]['Parameters'][Name]['Schema']>
                  }
              }>
            }
          
      }>>
    >

  // prettier-ignore
  export type ToSchema<Spec extends State.Base> = {
    [K in keyof Spec['Parameters'] & string as FlagName.Types.GetCanonicalName<Spec['Parameters'][K]['NameParsed']>]:
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
