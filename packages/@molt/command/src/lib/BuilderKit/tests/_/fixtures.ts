import { PrivateData } from '../../../PrivateData/PrivateData.js'
import { BuilderKit } from '../../BuilderKit.js'

export namespace Fixtures {
  export namespace A {
    export type State = {
      // a: PrivateData.Values.Atomic<string>
    }
    export type Builder<$State extends State = State> = BuilderKit.State.Setup<$State, {}> // prettier-ignore
    export interface BuilderFn extends BuilderKit.Fn<State> {
      return: Builder<this['params']>
    }
  }
  export namespace B {
    export type State = {
      a: PrivateData.Values.Atomic<string>
    }
    export type Builder<$State extends State=State> = BuilderKit.State.Setup<$State, {
			setA: BuilderKit.UpdaterAtomic<$State, 'a', BuilderFn>
		}> // prettier-ignore
    export interface BuilderFn extends BuilderKit.Fn<State> {
      return: Builder<this['params']>
    }
  }
}
