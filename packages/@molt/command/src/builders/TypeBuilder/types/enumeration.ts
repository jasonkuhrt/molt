import type {
  Enumeration,
  Member,
} from '../../../Type/types/Scalars/Enumeration.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'
import { PrivateData } from '../../../lib/PrivateData/PrivateData.js'
import type { HKT } from '../../../helpers.js'

export namespace State {
  export type Base<$Members extends readonly Member[] = readonly Member[]> = {
    members: PrivateData.Values.Atomic<$Members>
    description: PrivateData.Values.ValueString
  }
  export const initial: BuilderKit.State.RuntimeData<Base> = {
    members: PrivateData.Values.unsetSymbol,
    description: PrivateData.Values.unsetSymbol,
  }
}

type Builder<$State extends State.Base = State.Base> = BuilderKit.State.Setup<
  $State,
  {
    description: BuilderKit.UpdaterAtomic<$State, 'description', BuilderFn>
  }
>

// TODO when putting a non-unknown constraint on params parameter it leads to HKT calls doing an interesection ... why?
interface BuilderFn extends HKT.Fn<PrivateData.Data> {
  // @ts-expect-error todo
  return: Builder<this['params']>
}

const create = BuilderKit.createBuilder<
  State.Base,
  BuilderFn,
  [members: readonly string[]]
>()((members) => {
  return {
    type: null as any as Enumeration<typeof members>,
    members,
  }
})({
  initialState: State.initial,
  implementation: ({ updater }) => {
    return {
      description: updater(`description`),
    }
  },
})

export { create as enumeration, Builder as TypeBuilderEnumeration }
