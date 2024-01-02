/* eslint-disable */
import { produce } from 'immer'
import type { HKT, SetObjectProperty } from '../../helpers.js'
import type { Simplify } from 'type-fest'

export namespace BuilderKit {
  export type Fn<
    Params extends Data = {},
    Return extends object = object,
  > = HKT.Fn<Params, Return>

  const PrivateSymbol = Symbol(`Private`)

  type PrivateSymbol = typeof PrivateSymbol

  export type StateController = {
    resolve: ResolveController
    data: Data
  }

  export type Data = Record<string, State.Values.Value>

  export type Builder = {
    [PrivateSymbol]: StateController
  }

  export type BuilderFn = HKT.Fn

  export type PublicType<$Host extends Builder> = Omit<$Host, PrivateSymbol>

  export type StateRemove<$Builder extends Builder> = PublicType<$Builder>

  export type UpdaterAtomic<
    $State extends Data,
    $Path extends State.Property.Paths<$State>,
    $BuilderFn extends BuilderFn,
    $Signature extends State.Values.UpdateSignature<
      $State[$Path]['type']
    > | null = null,
  > = $State[$Path] extends State.Values.Atom
    ? $Signature extends State.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          $State[$Path],
          $Signature
        >
      : $State[$Path]['updateSignature'] extends State.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          $State[$Path],
          $State[$Path]['updateSignature']
        >
      : <$$Value extends $State[$Path]['type']>(
          value: $$Value,
        ) => HKT.Call<
          $BuilderFn,
          State.Property.Value.Set<$State, $Path, $$Value>
        >
    : never

  export type UpdaterFromSignature<
    $State extends Data,
    $Path extends State.Property.Paths<$State>,
    $BuilderFn extends BuilderFn,
    $Value extends State.Values.Atom,
    $Signature extends State.Values.UpdateSignature,
  > = $Signature['args'] extends []
    ? () => HKT.Call<
        $BuilderFn,
        State.Property.Value.Set<
          $State,
          $Path,
          'return' extends keyof $Signature
            ? $Signature['return'] extends HKT.Fn
              ? HKT.Call<$Signature['return'], []>
              : $Signature['return']
            : $Value['type']
        >
      >
    : <$Args extends $Signature['args']>(
        ...args: $Args
      ) => HKT.Call<
        $BuilderFn,
        State.Property.Value.Set<
          $State,
          $Path,
          'return' extends keyof $Signature
            ? $Signature['return'] extends HKT.Fn
              ? HKT.Call<$Signature['return'], $Args>
              : $Signature['return']
            : $Value['type']
        >
      >

  export type SetPropertyValue<
    $BuilderFn extends BuilderFn,
    $State extends Data,
    $Path extends State.Property.Paths<$State>,
    $Value,
  > = HKT.Call<$BuilderFn, State.Property.Value.Set<$State, $Path, $Value>>

  export type SetPropertyValues<
    $BuilderFn extends BuilderFn,
    $State extends Data,
    $PropertyValues extends object,
  > = HKT.Call<$BuilderFn, State.Property.Value.SetAll<$State, $PropertyValues>>

  export type WithMinState<
    $BuilderFn extends BuilderFn,
    $StateBase extends Data,
    $PropertyValues extends object,
  > = HKT.Call<
    $BuilderFn,
    State.Property.Value.SetAll<$StateBase, $PropertyValues>
  >

  type ResolveController = () => unknown

  export type HostTarget = object
  export type SetupHost<$Data, $Obj extends HostTarget> = SetObjectProperty<
    $Obj,
    PrivateSymbol,
    $Data
  >

  export namespace State {
    export type Setup<
      $State extends Data,
      BuilderWithoutState extends object,
    > = SetupHost<$State, BuilderWithoutState>

    export type Get<$Builder extends Builder> = $Builder[PrivateSymbol]

    export namespace Values {
      type Args = [...unknown[]]
      export type ExcludeUnsetSymbol<$Value extends unknown> = Exclude<
        $Value,
        Unset
      >
      export const unsetSymbol = Symbol(`Unset`)
      export type Unset = typeof unsetSymbol
      export type UpdateSignature<$Return extends unknown = unknown> =
        | { args: Args; return: $Return }
        | { args: Args }

      const typeSymbol = Symbol(`Type`)
      export type Type<$Type = unknown> = {
        [typeSymbol]: 1
        type: $Type
        value: $Type
      }

      const valueSymbol = Symbol(`Value`)

      export type Atom<
        $Type extends unknown = unknown,
        $ValueDefault extends $Type | Unset = Unset | $Type,
        $UpdateSignature extends Unset | UpdateSignature<$Type> =
          | Unset
          | UpdateSignature<$Type>,
        $Value extends $Type | Unset = Unset | $Type,
      > = {
        [valueSymbol]: 1
        type: $Type
        updateSignature: $UpdateSignature
        valueDefault: $ValueDefault
        // value: UnsetSymbol extends $ValueDefault ? $Value : $ValueDefault
        value: $Value
      }

      export type ValueString = Atom<string>
      export type ValueBoolean = Atom<boolean>
      export type ValueNumber = Atom<number>

      // -- index
      // export type IndexUpdateSignature =
      //   | { key: string; args: Args }
      //   | { key: string; args: Args; return: unknown }

      // const indexSymbol = Symbol(`Index`)

      // export type Index<
      //   $Type extends unknown = unknown,
      //   // $ValueDefault extends $Type | UnsetSymbol = UnsetSymbol | $Type,
      //   // $UpdateSignature extends UnsetSymbol | UpdateSignature =
      //   //   | UnsetSymbol
      //   //   | UpdateSignature,
      // > = {
      //   [indexSymbol]: 1
      //   type: Record<string, $Type>
      //   // updateSignature: $UpdateSignature
      //   // valueDefault: $ValueDefault
      //   value: $Type | UnsetSymbol
      // }

      export type Value = Atom | Type

      // -- utilities

      export type IsSet<$Value extends Value> = $Value extends Atom
        ? Unset extends $Value['value']
          ? false
          : true
        : true

      export type Set<
        $Value extends Atom,
        $ValueValue extends $Value['type'],
      > = SetObjectProperty<$Value, 'value', $ValueValue>

      // -- namespace

      // const namespaceSymbol = Symbol(`Namespace`)

      // export type Namespace<
      //   $Values extends Record<string, Atomic> = Record<string, Atomic>,
      // > = {
      //   [namespaceSymbol]: 1
      // } & $Values

      // --- terms

      export const valueUnset: Atom<any> = {
        [valueSymbol]: 1,
        type: 0, // ignoreme, just for type level
        updateSignature: unsetSymbol,
        valueDefault: unsetSymbol,
        value: unsetSymbol,
      }

      export const unset: Unset = Values.unsetSymbol
      export type ExcludeUnset<$Value> = Values.ExcludeUnsetSymbol<$Value>
    }

    // prettier-ignore
    export type RuntimeData<$State extends Data> = Simplify<{
      readonly [K in keyof $State & string as $State[K] extends Values.Type ? never : K]:
        $State[K] extends Values.Atom
        ? Values.Unset extends $State[K]['valueDefault']
          ? $State[K]['value']
          : $State[K]['valueDefault']
        : // : $State[K] extends PrivateData.Values.Namespace
          // ? Initial<$State[K]>
          never
    }>

    // export type SetProperties<
    //   $State extends State,
    //   $PropertyValues extends object,
    // > = {
    //   [$Key in keyof $State]: $Key extends keyof $PropertyValues
    //     ? $State[$Key] extends PrivateData.Values.Atomic
    //       ? SetObjectProperty<$State[$Key], 'value', $PropertyValues[$Key]>
    //       : $State[$Key] extends PrivateData.Values.Namespace
    //       ? $PropertyValues[$Key] extends object
    //         ? SetProperties<$State[$Key], $PropertyValues[$Key]>
    //         : 'Error: Assigning non-object to namespace'
    //       : 'Error: unknown kind of private data'
    //     : $State[$Key]
    // }

    export namespace Property {
      // export type SetProperty<
      //   $State extends State,
      //   $Path extends PropertyPaths<$State>,
      //   $Value,
      // > = $Path extends `${infer $Key}.${infer $Rest}`
      //   ? $State[$Key] extends PrivateData.Values.Namespace
      //     ? SetObjectProperty<
      //         $State,
      //         $Key,
      //         SetProperty<$State[$Key], $Rest, $Value>
      //       >
      //     : never //`Error: More path on non-namespace: ${$Key}`
      //   : $Path extends `${infer $Key}`
      //   ? $State[$Key] extends PrivateData.Values.Atomic
      //     ? SetObjectProperty<
      //         $State,
      //         $Key,
      //         SetObjectProperty<$State[$Key], 'value', $Value>
      //       >
      //     : never
      //   : never //'Error: Non-atomic path on atomic'

      export type Get<
        $State extends Data,
        $Path extends Paths<$State>,
      > = $State[$Path] extends Values.Value ? $State[$Path] : never

      export namespace Value {
        export type Get<
          $State extends Data,
          $Path extends Paths<$State>,
        > = $State[$Path] extends Values.Atom
          ? $State[$Path]['value']
          : $State[$Path] extends Values.Type
          ? $State[$Path]['value']
          : never

        export type IsSet<
          $State extends Data,
          $Path extends Paths<$State>,
        > = Values.IsSet<Property.Get<$State, $Path>>

        export type IsUnset<
          $State extends Data,
          $Path extends Paths<$State>,
        > = IsSet<$State, $Path> extends true ? false : true

        export type Set<
          $State extends Data,
          $Path extends Paths<$State>,
          $Value,
        > = SetObjectProperty<
          $State,
          $Path,
          SetObjectProperty<$State[$Path], 'value', $Value>
        >
        // prettier-ignore
        export type SetAll<
          $State extends Data,
          $PropertyValues extends object,
        > = 
        {
          [$Key in keyof $State & string]:
            $Key extends keyof $PropertyValues
              ? $State[$Key] extends Values.Atom | Values.Type
              ? SetObjectProperty<$State[$Key], 'value', $PropertyValues[$Key]>
              : 'Error: unknown kind of private data'
           : $State[$Key]
        }

        export type GetOrDefault<
          $State extends Data,
          $Path extends Paths<$State>,
        > = $State[$Path] extends Values.Atom
          ? Values.Unset extends $State[$Path]['value']
            ? Values.Unset extends $State[$Path]['valueDefault']
              ? $State[$Path]['value']
              : $State[$Path]['valueDefault']
            : $State[$Path]['value']
          : never

        export type GetSet<
          $State extends Data,
          $Path extends Paths<$State>,
        > = Values.ExcludeUnsetSymbol<Get<$State, $Path>>
      }

      // export type GetProperty<
      //   $State extends State,
      //   $Path extends PropertyPaths<$State>,
      // > = $Path extends `${infer $Key}.${infer $Rest}`
      //   ? $State[$Key] extends PrivateData.Values.Namespace
      //     ? GetProperty<$State[$Key], $Rest>
      //     : never //`Error: More path on non-namespace: ${$Key}`
      //   : $Path extends `${infer $Key}`
      //   ? $State[$Key] extends PrivateData.Values.Atomic
      //     ? $State[$Key]
      //     : never
      //   : never //'Error: Non-atomic path on atomic'
      export type Paths<$State extends Data> = string
      // export type PropertyPaths<$State extends State> = PropertyPaths_<'', $State>
      // type PropertyPaths_<$Path extends string, $State extends State> = Values<{
      //   [K in keyof $State & string]: $State[K] extends PrivateData.Values.Atomic
      //     ? Path.Join<$Path, K>
      //     : $State[K] extends PrivateData.Values.Namespace
      //     ? PropertyPaths_<Path.Join<$Path, K>, $State[K]>
      //     : never
      // }>
    }

    // prettier-ignore
    export const get = <$Host extends Builder>(obj: $Host): Simplify<Get<$Host>> =>
      obj[PrivateSymbol] as any

    export const set = <$PrivateData, $Obj extends object>(
      privateData: $PrivateData,
      object: $Obj,
    ): SetupHost<$PrivateData, $Obj> => {
      return {
        [PrivateSymbol]: privateData,
        ...object,
      }
    }
  }

  export namespace Builder {
    export type ToStaticInterface<$Builder extends Builder> = ToStaticReturn<
      StateRemove<$Builder>
    >

    /**
     * Simplify a builder's methods to always return the same builder type.
     *
     * This type is useful in some generic coding situations where types need to be loosened.
     */
    export type ToStaticReturn<$Builder extends StateRemove<Builder>> = {
      [K in keyof $Builder]: $Builder[K] extends (...args: infer $Args) => any
        ? (...args: $Args) => ToStaticReturn<$Builder>
        : never
    }
  }

  // prettier-ignore
  type OptionalTypeFunction =
    | null
    | TypeFunction

  // prettier-ignore
  type TypeFunction =
    HKT.Fn&{paramsConstraint:[...unknown[]]}

  // prettier-ignore
  type GetTypeFunctionParameters<$TypeFunction extends OptionalTypeFunction> =
    $TypeFunction extends TypeFunction ? $TypeFunction['paramsConstraint'] : []

  // TODO how to make 'any' here be 'unknown'?
  // prettier-ignore
  // type CreateBuilder =  <$StateBase extends State, $BuilderFn extends BuilderFn, $ConstructorFn extends OptionalTypeFunction>() =>
  type CreateBuilder =  <$Builder extends { state: Data; resolve: unknown; chain: BuilderFn; constructor: OptionalTypeFunction }>() =>
                            <_$BuilderInternal extends Builder.ToStaticInterface<HKT.Call<$Builder['chain'], $Builder['state']>>, const _$Params extends {
                                initialState: State.RuntimeData<$Builder['state']>
                                implementation: (params: {
                                  state: BuilderKit.State.RuntimeData<$Builder['state']>
                                  updater: Updater<$Builder['state'], _$BuilderInternal>
                                  recurse: <$State extends $Builder['state']>(state: State.RuntimeData<$State>) => _$BuilderInternal
                                }) => _$BuilderInternal
                              } & (
                                $Builder['constructor'] extends TypeFunction
                                  ? { constructor: ( ...args: GetTypeFunctionParameters<$Builder['constructor']>) => HKT.Call<$Builder['constructor'], GetTypeFunctionParameters<$Builder['constructor']>> }
                                  : { }
                              ) & (
                                $Builder['resolve'] extends null
                                  ? {}
                                  : { resolve: (state: State.RuntimeData<$Builder['state']>) => HKT.CallOrReturn<$Builder['resolve'], $Builder['state']> }

                              )
                            >(params: _$Params) =>
                              $Builder['constructor'] extends TypeFunction
                              ? <const $ConstructorArgs extends $Builder['constructor']['paramsConstraint']>(...args: $ConstructorArgs) => HKT.Call<$Builder['constructor'], BuilderKit.State.Property.Value.SetAll<$Builder['state'], HKT.Call<$Builder['constructor'], $ConstructorArgs>>>
                              : () => HKT.Call<$Builder['chain'], $Builder['state']>

  export const createBuilder: CreateBuilder = () => {
    return (params: any) => {
      const create = (...args: any[]) => {
        const initialState = params.constructor
          ? {
              // todo params.resolve needs to be exposed statically too
              $resolve: params.resolve,
              ...params.initialState,
              ...params.constructor?.(...args),
            }
          : params.initialState
        return create_(initialState)
      }

      const create_: any = (state: any) => {
        const updater: any = createUpdater({ state, createBuilder: create_ })
        const builder = State.set(
          state,
          params.implementation({ state, updater, recurse: create_ }),
        )
        return builder
      }

      return create
    }
  }

  export type Updater<
    $State extends Data,
    $Builder extends StateRemove<Builder>,
  > = <
    $PathExpression extends State.Property.Paths<$State>,
    $Args extends [State.Property.Get<$State, $PathExpression>['type']],
  >(
    pathExpression: $PathExpression,
    updater?: (
      ...args: $Args
    ) => State.Property.Get<$State, $PathExpression>['type'],
  ) => (...args: $Args) => $Builder

  // prettier-ignore
  export const valueIsUnset = (value: unknown): value is BuilderKit.State.Values.Unset => {
    return value === BuilderKit.State.Values.unset
  }

  // prettier-ignore
  export const valueOrUndefined = <$Value>(value: $Value): BuilderKit.State.Values.ExcludeUnset<$Value> | undefined => {
    return value === BuilderKit.State.Values.unset ? undefined : value
  }

  export const assertValueSet = <$Value>(
    value: $Value,
  ): asserts value is BuilderKit.State.Values.ExcludeUnset<$Value> => {
    if (value === BuilderKit.State.Values.unset) {
      throw new Error(`Value is unset. Expected it to be set.`)
    }
  }

  export const createUpdater =
    <
      $State extends Data,
      $Builder extends (state: State.RuntimeData<$State>) => unknown,
    >(params: {
      state: $State
      createBuilder: $Builder
    }) =>
    <$Args extends unknown[]>(
      pathExpression: State.Property.Paths<$State>,
      updater?: (...args: $Args) => unknown,
    ) =>
    (...args: $Args) => {
      return params.createBuilder(
        produce(params.state, (draft) => {
          const path = pathExpression.split(`.`)
          const objectPath = path.slice(0, -1)
          const valuePath = path.slice(-1)
          const object = objectPath.reduce((acc, key) => {
            // @ts-expect-error fixme
            if (acc[key] === undefined) acc[key] = {}
            return acc[key] as any
          }, draft)
          // @ts-expect-error fixme
          object[valuePath] = updater?.(...args) ?? args[0]
        }) as any as State.RuntimeData<$State>,
      )
    }
}
