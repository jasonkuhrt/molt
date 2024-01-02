import type { PrivateData } from '../../../PrivateData/PrivateData.js'
import type { BuilderKit } from '../../BuilderKit.js'

export namespace Fixtures {
  export namespace A {
    export type State = {
      // a: PrivateData.Values.Atomic<string>
    }

    export type Chain<$State extends State = State> = BuilderKit.State.Setup<$State, {}> // prettier-ignore
    export interface ChainFn extends BuilderKit.Fn<State> {
      return: Chain<this['params']>
    }
    export type BuilderStatic = BuilderKit.Builder.ToStaticInterface<Chain>
  }
  export namespace B {
    export type State = {
      a: PrivateData.Values.Atomic<string>
    }
    export type Builder<$State extends State=State> = BuilderKit.State.Setup<$State, {
			setA: BuilderKit.UpdaterAtomic<$State, 'a', ChainFn>
		}> // prettier-ignore
    export interface ChainFn extends BuilderKit.Fn<State> {
      return: Builder<this['params']>
    }
    export type BuilderStatic = BuilderKit.Builder.ToStaticInterface<Builder>
  }
}
