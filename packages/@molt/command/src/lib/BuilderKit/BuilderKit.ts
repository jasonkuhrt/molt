import { produce } from 'immer'
import type { HKT, SetObjectProperty } from '../../helpers.js'
import { PrivateData } from '../PrivateData/PrivateData.js'
import type { Simplify } from 'type-fest'

export namespace BuilderKit {
  export type Builder = PrivateData.Host

  export type BuilderFn = HKT.Fn<unknown, unknown>

  export type State = PrivateData.Data

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
      export type Unset = PrivateData.Values.UnsetSymbol
      export const unset: Unset = PrivateData.Values.unsetSymbol
      export type ExcludeUnset<$Value> =
        PrivateData.Values.ExcludeUnsetSymbol<$Value>
    }
    export type Initial<$State extends State> = Simplify<{
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
  export const createBuilder = <
    $State extends State,
    $Builder extends Builder,
  >(params: {
    initialState: State.Initial<$State>
    implementation: (params: {
      state: State.Initial<$State>
      updater: Updater<$State>
    }) => object
  }): (() => $Builder) => {
    const create = () => {
      return create_(initialState)
    }

    const create_ = (state: $State) => {
      const updater = createUpdater({ state, createBuilder: create_ })
      const builder = PrivateData.set(
        state,
        params.implementation({ state, updater }),
      )
      return builder
    }

    return create
  }

  type Updater<$State extends State> = <
    $Builder extends (state: State.Initial<$State>) => unknown,
  >(params: {
    state: $State
    createBuilder: $Builder
  }) => <$Args extends unknown[]>(
    pathExpression: State.PropertyPaths<$State>,
    updater?: (...args: $Args) => unknown,
  ) => (...args: $Args) => object

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

type VT1 = PrivateData.Values.Type<1>
type VA1 = PrivateData.Values.Atomic<number>
type V1Set = PrivateData.Values.Atomic<number> & { value: 2 }
type V3 = PrivateData.Values.Atomic<1 | 2 | 3, 2>
type V4 = PrivateData.Values.Atomic<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: [] }> // prettier-ignore
type V5 = PrivateData.Values.Atomic<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: ['x'] }> // prettier-ignore
type V6 = PrivateData.Values.Atomic<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: ['x']; return: 1 }> // prettier-ignore
type V7 = PrivateData.Values.Atomic<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: ['x']; return: Fn1 }> // prettier-ignore
type S1 = { a: VA1 }
type S4 = { a: V4 }
type S5 = { a: V5 }
type S6 = { a: V6 }
type S7 = { a: V7 }
type SA = { a: VA1 }
type SB = { a: V1Set }
// type B<S extends BuilderKit.State> = BuilderKit.State.Setup<S, { x: 0 }>
type B1<$State extends S1 = S1> = BuilderKit.State.Setup<$State, {}>
interface B1Fn extends HKT.Fn<S1> {
  return: B1<this['params']>
}
interface Fn1 extends HKT.Fn<number> {
  return: this['params']
}

// prettier-ignore
type _ = [
  // T<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA }> }>, 'a.a'>,
  // T<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA; b: VA }> }>, 'a.a' | 'a.b'>,
  // T<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA; b: VA }>; b: VA }>, 'a.a' | 'a.b' | 'b'>,
  //---
  T<BuilderKit.State.Property.Get<S1,'a'>, VA1>,
  //---
  T<BuilderKit.State.Property.Value.Get<{a:VT1},'a'>, 1>,
  // T<BuilderKit.State.GetProperty<{ a: PrivateData.Values.Namespace<{a:VA}> },'a.a'>, VA>,
  //---
  T<BuilderKit.State.Property.Value.GetOrDefault<S1, 'a'>, number | BuilderKit.State.Values.Unset>,
  T<BuilderKit.State.Property.Value.GetOrDefault<{a:PrivateData.Values.Atomic<1|2>}, 'a'>, 1|2|BuilderKit.State.Values.Unset>,
  T<BuilderKit.State.Property.Value.GetOrDefault<{a:PrivateData.Values.Atomic<1|2,1>}, 'a'>, 1>,
  // @ts-expect-error test
  T<BuilderKit.State.Property.Value.GetOrDefault<{a:PrivateData.Values.Atomic<1|2,1>}, 'a'>, 1 | BuilderKit.State.Values.Unset>,
  //---
  T<BuilderKit.State.Property.Value.GetSet<S1, 'a'>, number>,
  T<BuilderKit.State.Property.Value.GetSet<{ a: V1Set }, 'a'>, 2>,
  // @ts-expect-error test
  T<BuilderKit.State.Property.Value.GetSet<{ a: V1Set }, 'a'>, 2 | BuilderKit.State.Values.Unset>,
  //---
  T<BuilderKit.State.Property.Value.IsSet<{ a: V1Set }, 'a'>, true>,
  T<BuilderKit.State.Property.Value.IsSet<S1, 'a'>, false>,
  //---
  T<BuilderKit.State.Property.Value.IsUnset<{ a: V1Set }, 'a'>, false>,
  T<BuilderKit.State.Property.Value.IsUnset<S1, 'a'>, true>,
  //---
  T<BuilderKit.State.Property.Value.Set<S1, 'a', 2>, { a: V1Set }>,
  // T<BuilderKit.State.SetProperty<{ a: PrivateData.Values.Namespace<{ a: VA }> }, 'a.a', 2>, { a: PrivateData.Values.Namespace<{ a: VSet }> }>,
  //---
  T<BuilderKit.State.Property.Value.SetAll<S1, { a: 2 }>, { a: V1Set }>,
  T<BuilderKit.State.Property.Value.SetAll<{ a: VA1, b: V1Set, c: VA1 }, { a: 2 }>, { a: V1Set /* < */, b: V1Set, c: VA1 }>,
  // T<BuilderKit.State.Property.SetAll<{ a: PrivateData.Values.Namespace<{ a: VA }> }, { a: { a:2 } }>, { a: PrivateData.Values.Namespace<{ a: VSet }> }>,
  //---
  T<BuilderKit.State.Setup<S1, { x: 0 }>, PrivateData.SetupHost<{a:VA1},{x:0}>>,
  //---
  T<BuilderKit.State.Get<BuilderKit.WithMinState<B1Fn, SA, { a: 2 }>>, SB>,
  //---
  T<BuilderKit.WithMinState<B1Fn, SA, { a: 2 }>, B1<SB>>,
  //---
  T<BuilderKit.State.Initial<{ a: V3 }>, { a: 2 }>,
  T<BuilderKit.State.Initial<S1>, { a: 1 | BuilderKit.State.Values.Unset }>,
  T<BuilderKit.State.Initial<S1>, { a: 1 | typeof BuilderKit.State.Values.unset }>,
  T<BuilderKit.State.Initial<{ a: V1Set }>, { a: 2 }>,
  // @ts-expect-error test
  T<BuilderKit.State.Initial<{ a: V1Set }>, { a: 2 | BuilderKit.State.Values.Unset }>,
  // @ts-expect-error test
  T<BuilderKit.State.Initial<S1>, { a: string }>,
  // @ts-expect-error test
  T<BuilderKit.State.Initial<S1>, { a: 1 | '' }>,
  //---
  T<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn>, <$Value extends number>(value: $Value) => B1<BuilderKit.State.Property.Value.Set<S1, "a", $Value>>>,
  T<BuilderKit.UpdaterAtomic<S4, 'a', B1Fn>, <$Value extends number>() => B1<BuilderKit.State.Property.Value.Set<S4, "a", $Value>>>,
  T<BuilderKit.UpdaterAtomic<S5, 'a', B1Fn>, <$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S5, "a", 1|2|3>>>,
  T<BuilderKit.UpdaterAtomic<S6, 'a', B1Fn>, <$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S6, "a", 1>>>,
  T<BuilderKit.UpdaterAtomic<S7, 'a', B1Fn>, <$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S7, "a", HKT.Call<Fn1,$Args>>>>,
  T<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:[] }>,                 <$Value extends number>() => B1<BuilderKit.State.Property.Value.Set<S1, "a", $Value>>>,
  T<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:[]; return: 1 }>,      () => B1<BuilderKit.State.Property.Value.Set<S1, "a", 1>>>,
  T<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:['x'] }>,              <$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", number>>>,
  T<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:['x']; return: 1 }>,   <$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", 1>>>,
  T<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:['x']; return: Fn1 }>, <$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", HKT.Call<Fn1, $Args>>>>,
  //---
  T<BuilderKit.State.Property.Paths<{}>, never>,
  T<BuilderKit.State.Property.Paths<S1>, 'a'>,
  T<BuilderKit.State.Property.Paths<{ a: VA1; b: VA1 }>, 'a' | 'b'>,

]
