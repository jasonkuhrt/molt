/* eslint-disable */
import type { BuilderKit } from '../BuilderKit.js'
import type { HKT } from '../../../helpers.js'
import { expectTypeOf, test } from 'vitest'

type VT1 = BuilderKit.State.Values.Type<1>
type VA1 = BuilderKit.State.Values.Atom<number>
type VA2 = BuilderKit.State.Values.Atom<number, number>
type V1Set = BuilderKit.State.Values.Atom<number> & { value: 2 }
type V3 = BuilderKit.State.Values.Atom<1 | 2 | 3, 2>
type V4 = BuilderKit.State.Values.Atom<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: [] }> // prettier-ignore
type V5 = BuilderKit.State.Values.Atom<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: ['x'] }> // prettier-ignore
type V6 = BuilderKit.State.Values.Atom<1 | 2 |3, BuilderKit.State.Values.Unset, { args: ['x']; return: 1 }> // prettier-ignore
type V7 = BuilderKit.State.Values.Atom<1 | 2 | 3, BuilderKit.State.Values.Unset, { args: ['x']; return: Fn1 }> // prettier-ignore
type S1 = { data: { a: VA1 }; resolve: null; name: string }
type S2 = { data: { a: VA2 }; resolve: null; name: string }
type S4 = { data: { a: V4 }; resolve: null; name: string }
type S5 = { data: { a: V5 }; resolve: null; name: string }
type S6 = { data: { a: V6 }; resolve: null; name: string }
type S7 = { data: { a: V7 }; resolve: null; name: string }
type SA = { data: { a: VA1 }; resolve: null; name: string }
type SB = { data: { a: V1Set }; resolve: null; name: string }
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
  // expectTypeOf<BuilderKit.State.PropertyPaths<{ a: BuilderKit.State.Values.Namespace<{ a: VA }> }>>().toEqualTypeOf<'a.a'>()
  // expectTypeOf<BuilderKit.State.PropertyPaths<{ a: BuilderKit.State.Values.Namespace<{ a: VA; b: VA }> }>>().toEqualTypeOf<'a.a' | 'a.b'>()
  // expectTypeOf<BuilderKit.State.PropertyPaths<{ a: BuilderKit.State.Values.Namespace<{ a: VA; b: VA }>; b: VA }>>().toEqualTypeOf<'a.a' | 'a.b' | 'b'>()
  //---
  expectTypeOf<BuilderKit.State.Property.Get<S1,'a'>>().toEqualTypeOf<VA1>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.Get<{a:VT1},'a'>>().toEqualTypeOf<1>()
  // expectTypeOf<BuilderKit.State.GetProperty<{ a: BuilderKit.State.Values.Namespace<{a:VA}> },'a.a'>>().toEqualTypeOf<VA>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<S1, 'a'>>().toEqualTypeOf<number | BuilderKit.State.Values.Unset>()
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<{data:{a:BuilderKit.State.Values.Atom<1|2>};resolve:null; name:string }, 'a'>>().toEqualTypeOf<1|2|BuilderKit.State.Values.Unset>()
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<{data:{a:BuilderKit.State.Values.Atom<1|2,1>};resolve:null; name:string }, 'a'>>().toEqualTypeOf<1>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.Property.Value.GetOrDefault<{a:BuilderKit.State.Values.Atom<1|2,1>}, 'a'>>().toEqualTypeOf<1 | BuilderKit.State.Values.Unset>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.GetSet<S1, 'a'>>().toEqualTypeOf<number>()
  expectTypeOf<BuilderKit.State.Property.Value.GetSet<{data:{ a: V1Set };resolve:null; name:string }, 'a'>>().toEqualTypeOf<2>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.Property.Value.GetSet<{ a: V1Set }, 'a'>>().toEqualTypeOf<2 | BuilderKit.State.Values.Unset>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.IsSet<{data:{ a: V1Set };resolve:null; name:string }, 'a'>>().toEqualTypeOf<true>()
  expectTypeOf<BuilderKit.State.Property.Value.IsSet<S1, 'a'>>().toEqualTypeOf<false>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.IsUnset<{data:{ a: V1Set };resolve:null; name:string }, 'a'>>().toEqualTypeOf<false>()
  expectTypeOf<BuilderKit.State.Property.Value.IsUnset<S1, 'a'>>().toEqualTypeOf<true>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.Set<S1, 'a', 2>>().toMatchTypeOf<{data:{ a: V1Set };resolve:null; name:string }>()
  // expectTypeOf<BuilderKit.State.SetProperty<{ a: BuilderKit.State.Values.Namespace<{ a: VA }> }, 'a.a', 2>>().toEqualTypeOf<{ a: BuilderKit.State.Values.Namespace<{ a: VSet }> }>()
  //---
  expectTypeOf<BuilderKit.State.Property.Value.SetAll<S1, { a: 2 }>>().toMatchTypeOf<{data:{ a: V1Set };resolve:null; name:string }>()
  expectTypeOf<BuilderKit.State.Property.Value.SetAll<{data:{ a: VA1, b: V1Set, c: VA1 };resolve:null; name:string }, { a: 2 }>>().toMatchTypeOf<{data:{ a: V1Set /* < */, b: V1Set, c: VA1 };resolve:null; name:string }>()
  // expectTypeOf<BuilderKit.State.Property.SetAll<{ a: BuilderKit.State.Values.Namespace<{ a: VA }> }, { a: { a:2 } }>>().toEqualTypeOf<{ a: BuilderKit.State.Values.Namespace<{ a: VSet }> }>()
  //---
  expectTypeOf<BuilderKit.State.Setup<S1, { x: 0 }>>().toEqualTypeOf<BuilderKit.SetupHost<{data:{a:VA1};resolve:null; name:string },{x:0}>>()
  //---
  expectTypeOf<BuilderKit.State.Get<BuilderKit.WithMinState<B1Fn, SA, { a: 2 }>>>().toMatchTypeOf<SB>()
})

// prettier-ignore
test('State.Initial', () => {
  expectTypeOf<BuilderKit.State.RuntimeData<{data:{ a: V3 };resolve:null; name:string }>>().toEqualTypeOf<{ readonly a: 2 }>()
  expectTypeOf<BuilderKit.State.RuntimeData<S1>>().toMatchTypeOf<{ a: number | BuilderKit.State.Values.Unset }>()
  expectTypeOf<BuilderKit.State.RuntimeData<S1>>().toMatchTypeOf<{ a: number | typeof BuilderKit.State.Values.unset }>()
  expectTypeOf<BuilderKit.State.RuntimeData<{data:{ a: V1Set };resolve:null; name:string }>>().toEqualTypeOf<{ readonly a: 2 }>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.RuntimeData<{ a: V1Set }>>().toEqualTypeOf<{ a: 2 | BuilderKit.State.Values.Unset }>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.RuntimeData<S1>>().toEqualTypeOf<{ a: string }>()
  // @ts-expect-error test
  expectTypeOf<BuilderKit.State.RuntimeData<S1>>().toEqualTypeOf<{ a: 1 | '' }>()
})

// prettier-ignore
test('WithMinState', () => {
  expectTypeOf<BuilderKit.WithMinState<B1Fn, SA, { a: 2 }>>().toMatchTypeOf<B1<SB>>()
})

// prettier-ignore
test('UpdaterAtom', () => {
  expectTypeOf<BuilderKit.UpdaterAtom<S1, 'a', B1Fn>>().toMatchTypeOf<<$Value extends number>(value: $Value) => B1<BuilderKit.State.Property.Value.Set<S1, "a", $Value>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S4, 'a', B1Fn>>().toMatchTypeOf<() => B1<BuilderKit.State.Property.Value.Set<S4, "a", number>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S5, 'a', B1Fn>>().toMatchTypeOf<<$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S5, "a", 1|2|3>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S6, 'a', B1Fn>>().toMatchTypeOf<<$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S6, "a", 1>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S7, 'a', B1Fn>>().toMatchTypeOf<<$Args extends ['x']>(...args:$Args) => B1<BuilderKit.State.Property.Value.Set<S7, "a", HKT.Call<Fn1,$Args>>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S1, 'a', B1Fn, { args:[] }>>().toMatchTypeOf<                () => B1<BuilderKit.State.Property.Value.Set<S1, "a", number>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S1, 'a', B1Fn, { args:[]; return: 1 }>>().toMatchTypeOf<     () => B1<BuilderKit.State.Property.Value.Set<S1, "a", 1>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S1, 'a', B1Fn, { args:['x'] }>>().toMatchTypeOf<             <$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", number>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S1, 'a', B1Fn, { args:['x']; return: 1 }>>().toMatchTypeOf<  <$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", 1>>>()
  expectTypeOf<BuilderKit.UpdaterAtom<S1, 'a', B1Fn, { args:['x']; return: Fn1 }>>().toMatchTypeOf<<$Args extends ['x']>(...args: $Args) => B1<BuilderKit.State.Property.Value.Set<S1, "a", HKT.Call<Fn1, $Args>>>>()
})

type x = BuilderKit.State.ToRuntime<S1>
test('toRuntime', () => {
  // without default value
  expectTypeOf<BuilderKit.State.ToRuntime<S1>>().toEqualTypeOf<{ resolve:()=>null; name:string; data:  { readonly a:number | BuilderKit.State.Values.Unset }}>() // prettier-ignore
  // with default value
  expectTypeOf<BuilderKit.State.ToRuntime<S2>>().toEqualTypeOf<{ resolve:()=>null; name:string; data:  { readonly a:number }}>() // prettier-ignore
})

// //---
// expectTypeOf<BuilderKit.State.Property.Paths<S1>>().toBeString()
// expectTypeOf<BuilderKit.State.Property.Paths<{}>>().toBeString()
// expectTypeOf<BuilderKit.State.Property.Paths<{}>>().toBeNever()
// expectTypeOf<Simplify<BuilderKit.State.Property.Paths<S1>>>().toMatchTypeOf<'a'>()
// expectTypeOf<BuilderKit.State.Property.Paths<{ a: VA1; b: VA1 }>>().toMatchTypeOf<'a' | 'b'>()
