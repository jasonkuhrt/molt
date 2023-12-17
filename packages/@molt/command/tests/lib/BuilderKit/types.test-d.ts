import type { BuilderKit } from '../../../src/lib/BuilderKit/BuilderKit.js'
import type { PrivateData } from '../../../src/lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../src/helpers.js'
import { expectTypeOf, test } from 'vitest'

type VT1 = PrivateData.Values.Type<1>
type VA1 = PrivateData.Values.Atomic<number>
type V1Set = PrivateData.Values.Atomic<number> & { value: 2 }
type V3 = PrivateData.Values.Atomic<1 | 2 | 3, 2>
type V4 = PrivateData.Values.Atomic<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: [] }> // prettier-ignore
type V5 = PrivateData.Values.Atomic<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: ['x'] }> // prettier-ignore
type V6 = PrivateData.Values.Atomic<1 | 2 |3, BuilderKit.State.Values.Unset, { args: ['x']; return: 1 }> // prettier-ignore
type V7 = PrivateData.Values.Atomic<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: ['x']; return: Fn1 }> // prettier-ignore
type S1 = { a: VA1 }
type S4 = { a: V4 }
type S5 = { a: V5 }
type S6 = { a: V6 }
type S7 = { a: V7 }
type SA = { a: VA1 }
type SB = { a: V1Set }
// type B<S extends BuilderKit.State> = BuilderKit.State.Setup<S, { x: 0 }>()
type B1<$State extends S1 = S1> = BuilderKit.State.Setup<$State, {}>
interface B1Fn extends HKT.Fn<S1> {
  return: B1<this['params']>
}
interface Fn1 extends HKT.Fn<number> {
  return: this['params']
}

// prettier-ignore
test('State.Property.Value.*', () => {
  expectTypeOf<BuilderKit.State.Property.Get<S1, 'a'>>().toEqualTypeOf<VA1>()
  // expectTypeOf<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA }> }>>().toEqualTypeOf<'a.a'>()
  // expectTypeOf<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA; b: VA }> }>>().toEqualTypeOf<'a.a' | 'a.b'>()
  // expectTypeOf<BuilderKit.State.PropertyPaths<{ a: PrivateData.Values.Namespace<{ a: VA; b: VA }>; b: VA }>>().toEqualTypeOf<'a.a' | 'a.b' | 'b'>()
  //---
  expectTypeOf<BuilderKit.State.Property.Get<S1,'a'>>().toEqualTypeOf<VA1>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.Get<{a:VT1},'a'>>().toEqualTypeOf<1>()
  // expectTypeOf<BuilderKit.State.GetProperty<{ a: PrivateData.Values.Namespace<{a:VA}> },'a.a'>>().toEqualTypeOf<VA>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<S1, 'a'>>().toEqualTypeOf<number | BuilderKit.State.Values.Unset>()
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<{a:PrivateData.Values.Atomic<1|2>}, 'a'>>().toEqualTypeOf<1|2|BuilderKit.State.Values.Unset>()
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<{a:PrivateData.Values.Atomic<1|2,1>}, 'a'>>().toEqualTypeOf<1>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<{a:PrivateData.Values.Atomic<1|2,1>}, 'a'>>().toEqualTypeOf<1 | BuilderKit.State.Values.Unset>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.GetSet<S1, 'a'>>().toEqualTypeOf<number>()
  expectTypeOf<BuilderKit.State.Property.Value.GetSet<{ a: V1Set }, 'a'>>().toEqualTypeOf<2>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.Property.Value.GetSet<{ a: V1Set }, 'a'>>().toEqualTypeOf<2 | BuilderKit.State.Values.Unset>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.IsSet<{ a: V1Set }, 'a'>>().toEqualTypeOf<true>()
  expectTypeOf<BuilderKit.State.Property.Value.IsSet<S1, 'a'>>().toEqualTypeOf<false>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.IsUnset<{ a: V1Set }, 'a'>>().toEqualTypeOf<false>()
  expectTypeOf<BuilderKit.State.Property.Value.IsUnset<S1, 'a'>>().toEqualTypeOf<true>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.Set<S1, 'a', 2>>().toMatchTypeOf<{ a: V1Set }>()
  // expectTypeOf<BuilderKit.State.SetProperty<{ a: PrivateData.Values.Namespace<{ a: VA }> }, 'a.a', 2>>().toEqualTypeOf<{ a: PrivateData.Values.Namespace<{ a: VSet }> }>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.SetAll<S1, { a: 2 }>>().toMatchTypeOf<{ a: V1Set }>()
  expectTypeOf<BuilderKit.State.Property.Value.SetAll<{ a: VA1, b: V1Set, c: VA1 }, { a: 2 }>>().toMatchTypeOf<{ a: V1Set /* < */, b: V1Set, c: VA1 }>()
  // expectTypeOf<BuilderKit.State.Property.SetAll<{ a: PrivateData.Values.Namespace<{ a: VA }> }, { a: { a:2 } }>>().toEqualTypeOf<{ a: PrivateData.Values.Namespace<{ a: VSet }> }>()
  //---
  expectTypeOf<BuilderKit.State.Setup<S1, { x: 0 }>>().toEqualTypeOf<PrivateData.SetupHost<{a:VA1},{x:0}>>()
  //---
  expectTypeOf<BuilderKit.State.Get<BuilderKit.WithMinState<B1Fn, SA, { a: 2 }>>>().toMatchTypeOf<SB>()
})

// prettier-ignore
test('State.Initial', () => {
  expectTypeOf<BuilderKit.State.Initial<{ a: V3 }>>().toEqualTypeOf<{ a: 2 }>()
  expectTypeOf<BuilderKit.State.Initial<S1>>().toMatchTypeOf<{ a: number | BuilderKit.State.Values.Unset }>()
  expectTypeOf<BuilderKit.State.Initial<S1>>().toMatchTypeOf<{ a: number | typeof BuilderKit.State.Values.unset }>()
  expectTypeOf<BuilderKit.State.Initial<{ a: V1Set }>>().toEqualTypeOf<{ a: 2 }>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.Initial<{ a: V1Set }>>().toEqualTypeOf<{ a: 2 | BuilderKit.State.Values.Unset }>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.Initial<S1>>().toEqualTypeOf<{ a: string }>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.Initial<S1>>().toEqualTypeOf<{ a: 1 | '' }>()
})

// prettier-ignore
test('WithMinState', () => {
  expectTypeOf<BuilderKit.WithMinState<B1Fn, SA, { a: 2 }>>().toMatchTypeOf<B1<SB>>()
})

// prettier-ignore
test('UpdaterAtomic', () => {
  expectTypeOf<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn>>().toMatchTypeOf<<$Value extends number>(value: $Value) => B1<BuilderKit.State.Property.Value.Set<S1, "a", $Value>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S4, 'a', B1Fn>>().toMatchTypeOf<() => B1<BuilderKit.State.Property.Value.Set<S4, "a", number>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S5, 'a', B1Fn>>().toMatchTypeOf<<$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S5, "a", 1|2|3>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S6, 'a', B1Fn>>().toMatchTypeOf<<$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S6, "a", 1>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S7, 'a', B1Fn>>().toMatchTypeOf<<$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S7, "a", HKT.Call<Fn1,$Args>>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:[] }>>().toMatchTypeOf<                () => B1<BuilderKit.State.Property.Value.Set<S1, "a", number>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:[]; return: 1 }>>().toMatchTypeOf<     () => B1<BuilderKit.State.Property.Value.Set<S1, "a", 1>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:['x'] }>>().toMatchTypeOf<             <$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", number>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:['x']; return: 1 }>>().toMatchTypeOf<  <$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", 1>>>()
  expectTypeOf<BuilderKit.UpdaterAtomic<S1, 'a', B1Fn, { args:['x']; return: Fn1 }>>().toMatchTypeOf<<$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", HKT.Call<Fn1, $Args>>>>()

})

// //---
// expectTypeOf<BuilderKit.State.Property.Paths<S1>>().toBeString()
// expectTypeOf<BuilderKit.State.Property.Paths<{}>>().toBeString()
// expectTypeOf<BuilderKit.State.Property.Paths<{}>>().toBeNever()
// expectTypeOf<Simplify<BuilderKit.State.Property.Paths<S1>>>().toMatchTypeOf<'a'>()
// expectTypeOf<BuilderKit.State.Property.Paths<{ a: VA1; b: VA1 }>>().toMatchTypeOf<'a' | 'b'>()
