import { produce } from 'immer'
import type { HKT, SetObjectProperty } from '../../helpers.js'
import { PrivateData } from '../PrivateData/PrivateData.js'
import type { Simplify } from 'type-fest'

export namespace BuilderKit {
  // TODO use EmptyObject
  export type Fn<
    Params extends State = {},
    Return extends object = object,
  > = HKT.Fn<Params, Return>

  export type Builder = PrivateData.Host

  export type BuilderFn = HKT.Fn<unknown, Builder>

  export type State = PrivateData.Data

  export type StateRemove<$Builder extends Builder> =
    PrivateData.PublicType<$Builder>

  export type UpdaterAtomic<
    $State extends State,
    $Path extends State.Property.Paths<$State>,
    $BuilderFn extends BuilderFn,
    $Signature extends PrivateData.Values.UpdateSignature<
      $State[$Path]['type']
    > | null = null,
  > = $State[$Path] extends PrivateData.Values.Atomic
    ? $Signature extends PrivateData.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          $State[$Path],
          $Signature
        >
      : $State[$Path]['updateSignature'] extends PrivateData.Values.UpdateSignature
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
    $State extends State,
    $Path extends State.Property.Paths<$State>,
    $BuilderFn extends BuilderFn,
    $Value extends PrivateData.Values.Atomic,
    $Signature extends PrivateData.Values.UpdateSignature,
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
    $State extends State,
    $Path extends State.Property.Paths<$State>,
    $Value,
  > = HKT.Call<$BuilderFn, State.Property.Value.Set<$State, $Path, $Value>>

  export type WithMinState<
    $BuilderFn extends BuilderFn,
    $StateBase extends State,
    $PropertyValues extends object,
  > = HKT.Call<
    $BuilderFn,
    State.Property.Value.SetAll<$StateBase, $PropertyValues>
  >

  export namespace State {
    export type Setup<
      $State extends State,
      BuilderWithoutState extends object,
    > = PrivateData.SetupHost<$State, BuilderWithoutState>

    export type Get<$Builder extends PrivateData.Host> =
      PrivateData.Get<$Builder>

    export namespace Values {
      export type Atom = PrivateData.Values.Atomic
      export type Unset = PrivateData.Values.UnsetSymbol
      export const unset: Unset = PrivateData.Values.unsetSymbol
      export type ExcludeUnset<$Value> =
        PrivateData.Values.ExcludeUnsetSymbol<$Value>
    }
    export type RuntimeData<$State extends State> = Simplify<{
      [K in keyof $State & string as $State[K] extends PrivateData.Values.Type
        ? never
        : K]: $State[K] extends PrivateData.Values.Atomic
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
        $State extends State,
        $Path extends Paths<$State>,
      > = $State[$Path] extends PrivateData.Values.Value ? $State[$Path] : never

      export namespace Value {
        export type Get<
          $State extends State,
          $Path extends Paths<$State>,
        > = $State[$Path] extends PrivateData.Values.Atomic
          ? $State[$Path]['value']
          : $State[$Path] extends PrivateData.Values.Type
          ? $State[$Path]['value']
          : never

        export type IsSet<
          $State extends State,
          $Path extends Paths<$State>,
        > = PrivateData.Values.IsSet<Property.Get<$State, $Path>>

        export type IsUnset<
          $State extends State,
          $Path extends Paths<$State>,
        > = IsSet<$State, $Path> extends true ? false : true

        export type Set<
          $State extends State,
          $Path extends Paths<$State>,
          $Value,
        > = SetObjectProperty<
          $State,
          $Path,
          SetObjectProperty<$State[$Path], 'value', $Value>
        >
        export type SetAll<
          $State extends State,
          $PropertyValues extends object,
        > = {
          [$Key in keyof $State]: $Key extends keyof $PropertyValues
            ? $State[$Key] extends PrivateData.Values.Atomic
              ? SetObjectProperty<$State[$Key], 'value', $PropertyValues[$Key]>
              : never
            : $State[$Key]
        }

        export type GetOrDefault<
          $State extends State,
          $Path extends Paths<$State>,
        > = $State[$Path] extends PrivateData.Values.Atomic
          ? Values.Unset extends $State[$Path]['value']
            ? Values.Unset extends $State[$Path]['valueDefault']
              ? $State[$Path]['value']
              : $State[$Path]['valueDefault']
            : $State[$Path]['value']
          : never

        export type GetSet<
          $State extends State,
          $Path extends Paths<$State>,
        > = PrivateData.Values.ExcludeUnsetSymbol<Get<$State, $Path>>
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
      export type Paths<$State extends State> = string
      // export type PropertyPaths<$State extends State> = PropertyPaths_<'', $State>
      // type PropertyPaths_<$Path extends string, $State extends State> = Values<{
      //   [K in keyof $State & string]: $State[K] extends PrivateData.Values.Atomic
      //     ? Path.Join<$Path, K>
      //     : $State[K] extends PrivateData.Values.Namespace
      //     ? PropertyPaths_<Path.Join<$Path, K>, $State[K]>
      //     : never
      // }>
    }

    export const get = PrivateData.get
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

  // TODO how to collapse into a single function?
  export const createBuilder =
    <
      $StateBase extends State,
      $BuilderFn extends BuilderFn,
      $ConstructorInput extends [...any[]], // TODO how to make 'any' here be 'unknown'?
    >() =>
    <
      _$Constructor extends (
        ...args: $ConstructorInput
      ) => Partial<BuilderKit.State.RuntimeData<$StateBase>>,
      _$BuilderInternal extends Builder.ToStaticInterface<
        HKT.Call<$BuilderFn, $StateBase>
      > = Builder.ToStaticInterface<HKT.Call<$BuilderFn, $StateBase>>,
    >(
      params: {
        initialState: State.RuntimeData<$StateBase>
        implementation: (params: {
          state: $StateBase
          updater: Updater<$StateBase, _$BuilderInternal>
          recurse: <$State extends $StateBase>(
            state: State.RuntimeData<$State>,
          ) => _$BuilderInternal
        }) => _$BuilderInternal
      } & ($ConstructorInput extends []
        ? {} // eslint-disable-line
        : {
            constructor: _$Constructor
          }),
    ): $ConstructorInput extends []
      ? () => HKT.Call<$BuilderFn, $StateBase>
      : (
          ...args: $ConstructorInput
        ) => HKT.Call<
          $BuilderFn,
          BuilderKit.State.Property.Value.SetAll<
            $StateBase,
            ReturnType<_$Constructor>
          >
        > => {
      const create = () => {
        return create_(params.initialState)
      }

      const create_ = (state: $StateBase) => {
        const updater = createUpdater({ state, createBuilder: create_ })
        const builder = PrivateData.set(
          state,
          params.implementation({ state, updater, recurse: create_ }),
        )
        return builder
      }

      return create
    }

  export type Updater<
    $State extends State,
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

  export const createUpdater =
    <
      $State extends State,
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
            // @ts-expect-error fixme
            return acc[key]
          }, draft)
          // @ts-expect-error fixme
          object[valuePath] = updater?.(...args) ?? args[0]
        }) as any as State.RuntimeData<$State>,
      )
    }
}
