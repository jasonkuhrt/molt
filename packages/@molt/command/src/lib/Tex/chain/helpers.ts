import type { Block, List, Node, Table } from '../nodes.js'
import type { BlockBuilder } from './block.js'
import type { ListBuilder } from './list.js'
import type { RootBuilder } from './root.js'
import type { TableBuilder } from './table.js'

export type NodeImplementor<B extends Builder> = ($: B) => null | B

export type Builder = RootBuilder | BlockBuilder | TableBuilder | ListBuilder

export interface BuilderInternal<N = Node> {
  _: {
    node: N
  }
}

// prettier-ignore
export const toInternalBuilder = <Builder extends BlockBuilder<null>|TableBuilder|ListBuilder|null>(builder: Builder):
  Builder extends null               ? null                   :
  Builder extends BlockBuilder<null> ? BuilderInternal<Block> :
  Builder extends TableBuilder       ? BuilderInternal<Table> :
  Builder extends ListBuilder        ? BuilderInternal<List>  :
                                       never => 
  builder as any
