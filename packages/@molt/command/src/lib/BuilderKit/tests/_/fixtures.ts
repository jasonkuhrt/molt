import type { BuilderKit } from '../../BuilderKit.js'

export namespace Fixtures {
  export namespace A {
    export type State = {
      resolve: null
      data: {}
      // a: PrivateData.Values.Atomic<string>
    }

    export type Chain<$State extends State = State> = BuilderKit.State.Setup<$State, {}> // prettier-ignore
    export interface ChainFn extends BuilderKit.Fn<State, Chain> {
      return: Chain<this['params']>
    }
    export type BuilderStatic = BuilderKit.Builder.ToStaticInterface<Chain>
  }
  export namespace B {
    export type State = {
      resolve: null
      data: {
        a: BuilderKit.State.Values.Atom<string>
      }
    }

    // prettier-ignore
    export type Chain<$State extends State = State> =
      BuilderKit.State.Setup<$State, {
        setA: BuilderKit.UpdaterAtom<$State, 'a', ChainFn>
      }>

    // prettier-ignore
    export interface ChainFn extends BuilderKit.Fn<State,Chain> {
      return: Chain<this['params']>
    }

    export type BuilderStatic = BuilderKit.Builder.ToStaticInterface<Chain>
  }
}
