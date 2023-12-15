import type { BuilderKit } from 'packages/@molt/command/src/lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from 'packages/@molt/command/src/lib/PrivateData/PrivateData.js'
import type { HKT } from 'packages/@molt/command/src/helpers.js'
import type { T, T } from '../../_/helpers.js'

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
