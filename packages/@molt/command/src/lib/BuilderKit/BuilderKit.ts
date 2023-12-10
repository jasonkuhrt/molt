import { produce } from 'immer'
import type { HKT, Path, SetObjectProperty, Values } from '../../helpers.js'
import { PrivateData } from '../PrivateData/PrivateData.js'
import type { Simplify } from 'type-fest'

export namespace BuilderKit {
  export type Builder = PrivateData.Host

  export type BuilderFn = HKT.Fn<unknown, unknown>

  export type State = PrivateData.Data

  export namespace State {
    // export type Get<$Builder extends PrivateData.Host> =
    //   PrivateData.Get<$Builder>
    // export type Set<
    //   $State extends State,
    //   $Builder extends object,
    // > = PrivateData.SetupHost<$State, $Builder>
    // export type GetPropertyType<
    //   $State extends State,
    //   $Path extends string,
    // > = PrivateData.Values.Atomic extends Path.Get<$Path, $State>
    //   ? AccessValue<$Path, $State>['type']
    //   : never
    // export type GetPropertyValue<
    //   $State extends State,
    //   $Path extends string,
    // > = Path.Get<$Path, $State> extends PrivateData.Values.Atomic
    //   ? Path.Get<$Path, $State>['value']
    //   : never
    // export type GetProperty<
    //   $State extends State,
    //   $Path extends string,
    // > = Path.Get<$Path, $State> extends PrivateData.Values.Atomic
    //   ? Path.Get<$Path, $State>
    //   : never
    // export type UpdateProperty<
    //   $State extends State,
    //   $Path extends string,
    //   $Value extends State.GetPropertyType<$State, $Path>,
    // > = SetObjectProperty<
    //   $State,
    //   $Path,
    //   PrivateData.Values.Set<Path.Get<$Path, $State>, $Value>
    // >
  }

  // export type UpdateStateProperty<
  //   $State extends State,
  //   $Path extends string,
  //   $Value extends State.GetPropertyType<$State, $Path>,
  //   $BuilderFn extends HKT.Fn<$State, PrivateData.Host<$State>>,
  // > = HKT.Call<
  //   $BuilderFn,
  //   SetObjectProperty<
  //     $State,
  //     $Path,
  //     PrivateData.Values.Set<Path.Get<$Path, $State>, $Value>
  //   >
  // >

  export type UpdaterAtomic<
    $State extends State,
    $Path extends State.PropertyPaths<$State>,
    $BuilderFn extends BuilderFn,
    $Signature extends PrivateData.Values.UpdateSignature | null = null,
  > = Path.Get<$Path, $State> extends PrivateData.Values.Atomic
    ? $Signature extends PrivateData.Values.UpdateSignature
      ? UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          Path.Get<$Path, $State>,
          $Signature
        >
      : PrivateData.Values.UnsetSymbol extends Path.Get<
          $Path,
          $State
        >['updateSignature']
      ? <$$Value extends Path.Get<$Path, $State>['type']>(
          value: $$Value,
        ) => HKT.Call<$BuilderFn, State.SetProperty<$State, $Path, $$Value>>
      : UpdaterFromSignature<
          $State,
          $Path,
          $BuilderFn,
          State.GetProperty<$State, $Path>,
          State.GetProperty<$State, $Path>['updateSignature']
        >
    : never

  export type UpdaterFromSignature<
    $State extends State,
    $Path extends State.PropertyPaths<$State>,
    $BuilderFn extends BuilderFn,
    $Value extends PrivateData.Values.Atomic,
    $Signature extends PrivateData.Values.UpdateSignature,
  > = $Signature['args'] extends []
    ? () => HKT.Call<
        $BuilderFn,
        State.SetProperty<
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
        State.SetProperty<
          $State,
          $Path,
          'return' extends keyof $Signature
            ? $Signature['return'] extends HKT.Fn
              ? HKT.Call<$Signature['return'], $Args>
              : $Signature['return']
            : $Value['type']
        >
      >

  export type SetProperty<
    $BuilderFn extends BuilderFn,
    $State extends State,
    $Path extends State.PropertyPaths<$State>,
    $Value,
  > = HKT.Call<$BuilderFn, State.SetProperty<$State, $Path, $Value>>

  export type WithMinState<
    $BuilderFn extends BuilderFn,
    $StateBase extends State,
    $PropertyValues extends object,
  > = HKT.Call<$BuilderFn, State.SetProperties<$StateBase, $PropertyValues>>

  export type Create<
    $State extends State,
    Interface extends object,
  > = PrivateData.SetupHost<$State, Interface>

  export type GetState<$Builder extends PrivateData.Host> =
    PrivateData.Get<$Builder>

  export namespace State {
    export namespace Values {
      export type Unset = PrivateData.Values.UnsetSymbol
      export const unset: Unset = PrivateData.Values.unsetSymbol
    }
    export type Initial<$State extends State> = Simplify<{
      [K in keyof $State & string as $State[K] extends PrivateData.Values.Type
        ? never
        : K]: $State[K] extends PrivateData.Values.Atomic
        ? Values.Unset extends $State[K]['valueDefault']
          ? $State[K]['value']
          : $State[K]['valueDefault']
        : $State[K] extends PrivateData.Values.Namespace
        ? Initial<$State[K]>
        : never
    }>
    export type IsPropertySet<
      $State extends State,
      $Path extends PropertyPaths<$State>,
    > = PrivateData.Values.IsSet<GetProperty<$State, $Path>>
    export type IsUnset<
      $State extends State,
      $Path extends PropertyPaths<$State>,
    > = IsPropertySet<$State, $Path> extends true ? false : true

    export type SetProperties<
      $State extends State,
      $PropertyValues extends object,
    > = {
      [$Key in keyof $State]: $Key extends keyof $PropertyValues
        ? $State[$Key] extends PrivateData.Values.Atomic
          ? SetObjectProperty<$State[$Key], 'value', $PropertyValues[$Key]>
          : $State[$Key] extends PrivateData.Values.Namespace
          ? $PropertyValues[$Key] extends object
            ? SetProperties<$State[$Key], $PropertyValues[$Key]>
            : 'Error: Assigning non-object to namespace'
          : 'Error: unknown kind of private data'
        : $State[$Key]
    }
    export type SetProperty<
      $State extends State,
      $Path extends PropertyPaths<$State>,
      $Value,
    > = $Path extends `${infer $Key}.${infer $Rest}`
      ? $State[$Key] extends PrivateData.Values.Namespace
        ? SetObjectProperty<
            $State,
            $Key,
            SetProperty<$State[$Key], $Rest, $Value>
          >
        : never //`Error: More path on non-namespace: ${$Key}`
      : $Path extends `${infer $Key}`
      ? $State[$Key] extends PrivateData.Values.Atomic
        ? SetObjectProperty<
            $State,
            $Key,
            SetObjectProperty<$State[$Key], 'value', $Value>
          >
        : never
      : never //'Error: Non-atomic path on atomic'

    export type GetProperty<
      $State extends State,
      $Path extends PropertyPaths<$State>,
    > = $Path extends `${infer $Key}.${infer $Rest}`
      ? $State[$Key] extends PrivateData.Values.Namespace
        ? GetProperty<$State[$Key], $Rest>
        : never //`Error: More path on non-namespace: ${$Key}`
      : $Path extends `${infer $Key}`
      ? $State[$Key] extends PrivateData.Values.Atomic
        ? $State[$Key]
        : never
      : never //'Error: Non-atomic path on atomic'

    export type PropertyPaths<$State extends State> = PropertyPaths_<'', $State>

    type PropertyPaths_<$Path extends string, $State extends State> = Values<{
      [K in keyof $State & string]: $State[K] extends PrivateData.Values.Atomic
        ? Path.Join<$Path, K>
        : $State[K] extends PrivateData.Values.Namespace
        ? PropertyPaths_<Path.Join<$Path, K>, $State[K]>
        : never
    }>
  }
  export const createUpdater =
    <
      $State extends State,
      $Builder extends (state: State.Initial<$State>) => unknown,
    >(params: {
      state: $State
      createBuilder: $Builder
    }) =>
    <$Args extends unknown[]>(
      pathExpression: State.PropertyPaths<$State>,
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
        }) as any as State.Initial<$State>,
      )
    }
}

// tests

type T<A, B extends A> = { A: A; B: B }

type VA = PrivateData.Values.Atomic<number>
type VB = PrivateData.Values.Atomic<number> & { value: 2 }
type VC = PrivateData.Values.Atomic<1 | 2 | 3, 2>
type SA = { a: VA }
type SB = { a: VB }
type B<S extends BuilderKit.State> = BuilderKit.Create<S, { x: 0 }>
interface BFn extends HKT.Fn<BuilderKit.State> {
  return: B<this['params']>
}
// prettier-ignore
type _ = [
  //---
  T<BuilderKit.State.PropertyPaths<{}>, never>,
  T<BuilderKit.State.PropertyPaths<{ a: VA }>,'a'>,
  T<BuilderKit.State.PropertyPaths<{ a: VA; b: VA }>, 'a' | 'b'>,
  T<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA }> }>, 'a.a'>,
  T<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA; b: VA }> }>, 'a.a' | 'a.b'>,
  T<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA; b: VA }>; b: VA }>, 'a.a' | 'a.b' | 'b'>,
  //---
  T<BuilderKit.State.GetProperty<{ a: VA },'a'>, VA>,
  T<BuilderKit.State.GetProperty<{ a: PrivateData.Values.Namespace<{a:VA}> },'a.a'>, VA>,
  //---
  T<BuilderKit.State.SetProperty<{ a: VA }, 'a', 2>, { a: VB }>,
  T<BuilderKit.State.SetProperty<{ a: PrivateData.Values.Namespace<{ a: VA }> }, 'a.a', 2>, { a: PrivateData.Values.Namespace<{ a: VB }> }>,
  //---
  T<BuilderKit.State.SetProperties<{ a: VA }, { a: 2 }>, { a: VB }>,
  T<BuilderKit.State.SetProperties<{ a: VA, b: VB, c: VA }, { a: 2 }>, { a: VB /* < */, b: VB, c: VA }>,
  T<BuilderKit.State.SetProperties<{ a: PrivateData.Values.Namespace<{ a: VA }> }, { a: { a:2 } }>, { a: PrivateData.Values.Namespace<{ a: VB }> }>,
  //---
  T<BuilderKit.Create<{ a: VA }, { x: 0 }>, PrivateData.SetupHost<{a:VA},{x:0}>>,
  T<BuilderKit.WithMinState<BFn, SA, { a: 2 }>, B<SB>>,
  T<BuilderKit.GetState<BuilderKit.WithMinState<BFn, SA, { a: 2 }>>, SB>,
  //---
  T<BuilderKit.State.Initial<{ a: VC }>, { a: 2 }>,
  T<BuilderKit.State.Initial<{ a: VA }>, { a: 1 | BuilderKit.State.Values.Unset }>,
  T<BuilderKit.State.Initial<{ a: VA }>, { a: 1 | typeof BuilderKit.State.Values.unset }>,
  T<BuilderKit.State.Initial<{ a: VB }>, { a: 2 }>,
  // @ts-expect-error test
  T<BuilderKit.State.Initial<{ a: VB }>, { a: 2 | BuilderKit.State.Values.Unset }>,
  // @ts-expect-error test
  T<BuilderKit.State.Initial<{ a: VA }>, { a: string }>,
  // @ts-expect-error test
  T<BuilderKit.State.Initial<{ a: VA }>, { a: 1 | '' }>,

]
