import type { ListParameters } from '../nodes.js'
import { Leaf, List } from '../nodes.js'
import { Block } from '../nodes.js'
import type { NodeImplementor } from './helpers.js'
import { toInternalBuilder } from './helpers.js'

// prettier-ignore
export interface ListMethod<Chain> {
  (parameters: ListParameters, nodeishes: (string|Block|null)[])            : Chain
  (nodeishes: (string|Block|null)[])                                        : Chain
  (builder: NodeImplementor<ListBuilder>)                                   : Chain
}

export type ListArgs =
  | [parameters: ListParameters, nodeishes: (string | Block | null)[]]
  | [nodeishes: (string | Block | null)[]]
  | [NodeImplementor<ListBuilder>]

// prettier-ignore
export interface ListBuilder {
  set(parameters: ListParameters)   : ListBuilder
  item(node: Block | string)        : ListBuilder
  items(...nodes: Block[])          : ListBuilder
}

export const createListBuilder = (): ListBuilder => {
  const parentNode = new List()
  const $: ListBuilder = {
    set: (parameters) => {
      parentNode.setParameters(parameters)
      return $
    },
    item: (nodeish) => {
      const node = typeof nodeish === `string` ? new Block(new Leaf(nodeish)) : nodeish
      parentNode.items.push(node)
      return $
    },
    items: (...nodeishes) => {
      const nodes = nodeishes.map((_) => (typeof _ === `string` ? new Block(new Leaf(_)) : _))
      parentNode.items.push(...nodes)
      return $
    },
  }
  // Define Internal Methods
  toInternalBuilder($)._ = {
    node: parentNode,
  }
  return $
}
