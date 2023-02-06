import { Text } from '../Text/index.js'
import type { BlockParameters, ListParameters, Node, TableParameters } from './index_.js'
import { List } from './index_.js'
import { Leaf, Table } from './index_.js'
import { Block } from './index_.js'

// prettier-ignore
export interface BlockBuilder<Chain = null> {
  // block(parameters: BlockParameters, builder: ($: BuilderBase) => BuilderBase)  : Chain extends null ? BuilderBase : Chain
  block(builder: ($: BlockBuilder) => null|BlockBuilder)                        : Chain extends null ? BlockBuilder : Chain
  block(children: (string|null|RootBuilder|BlockBuilder)[])                           : Chain extends null ? BlockBuilder : Chain
  block(children: string|null|RootBuilder|BlockBuilder)                               : Chain extends null ? BlockBuilder : Chain
  block(parameters: BlockParameters, children: BlockBuilder|RootBuilder|string|null)                         : Chain extends null ? BlockBuilder : Chain

  table(rows: Block[][])                                                        : Chain extends null ? BlockBuilder : Chain
  table(builder: ($: TableBuilder) => null|TableBuilder)                        : Chain extends null ? BlockBuilder : Chain

  list(parameters: ListParameters, nodeishes: (string|Block)[])                                                 : Chain extends null ? BlockBuilder : Chain
  list(nodeishes: (string|Block)[])                                                 : Chain extends null ? BlockBuilder : Chain
  list(builder: ($: ListBuilder) => null|ListBuilder)                           : Chain extends null ? BlockBuilder : Chain
  
  text(text: string)                                                            : Chain extends null ? BlockBuilder : Chain

  set(parameters: BlockParameters)                                              : Chain extends null ? BlockBuilder : Chain
}

export interface TableBuilder {
  set(parameters: TableParameters): TableBuilder
  row(...cells: (BlockBuilder | RootBuilder | Block | string)[]): TableBuilder
  rows(...rows: (BlockBuilder | RootBuilder | Block | string)[][]): TableBuilder
  headers(headers: (string | Block)[]): TableBuilder
  header(header: null | string | Block): TableBuilder
}

export interface ListBuilder {
  set(parameters: ListParameters): ListBuilder
  item(node: Block | string): ListBuilder
  items(...nodes: Block[]): ListBuilder
}

export interface RootBuilder extends BlockBuilder<RootBuilder> {
  render(): string
}

interface BuilderInternal<N = Node> {
  _: {
    node: N
    // parameters: BlockParameters
  }
}

const createBlockBuilder = (params?: { getSuperChain: () => any }): BlockBuilder => {
  const parentNode = new Block()
  // let parentParameters: = parameters ?? {}

  const $: BlockBuilder = {
    block: (
      ...args:
        | [BlockParameters, string | null | BlockBuilder | RootBuilder]
        | [string | null | BlockBuilder | RootBuilder]
        | [(string | null | BlockBuilder | RootBuilder)[]]
        // | [BlockParameters, ($: BuilderBase) => BuilderBase]
        | [($: BlockBuilder) => null | BlockBuilder]
    ) => {
      const parameters = args.length === 1 ? null : args[0]
      const content = args.length === 1 ? args[0] : args[1]
      if (content) {
        let node: null | Block
        if (typeof content === `string`) {
          node = new Block(new Leaf(content))
        } else if (typeof content === `function`) {
          const result = content(createRootBuilder())
          node = result === null ? null : (result as any as BuilderInternal<Block>)._.node
        } else if (Array.isArray(content)) {
          node = new Block(
            content
              .filter((_): _ is string | BlockBuilder | RootBuilder => _ !== null)
              .map((_) => (typeof _ === `string` ? new Leaf(_) : (_ as any as BuilderInternal<Block>)._.node))
          )
        } else {
          node = (content as any as BuilderInternal<Block>)._.node
        }

        if (node) {
          if (parameters) {
            node.setParameters(parameters)
          }

          parentNode.addChild(node)
        }
      }

      return params?.getSuperChain() ?? $
    },
    set: (parameters: BlockParameters) => {
      parentNode.setParameters(parameters)
      return params?.getSuperChain() ?? $
    },
    table: (rows) => {
      const node =
        typeof rows === `function`
          ? (rows(createTableBuilder()) as any as BuilderInternal<Table>)._.node
          : new Table(rows)
      parentNode.addChild(node)
      return params?.getSuperChain() ?? $
    },
    list: (
      ...args:
        | [nodeishes: (string | Block)[] | (($: ListBuilder) => null | ListBuilder)]
        | [parameters: ListParameters, nodeishes: (string | Block)[]]
    ) => {
      const parameters = args.length === 1 ? null : args[0]
      const nodeishes = args.length === 1 ? args[0] : args[1]
      const node =
        typeof nodeishes === `function`
          ? (nodeishes(createListBuilder()) as any as BuilderInternal<List>)._.node
          : new List(nodeishes.map((_) => (typeof _ === `string` ? new Block(new Leaf(_)) : _)))
      parentNode.addChild(node)
      if (parameters) {
        node.setParameters(parameters)
      }
      return params?.getSuperChain() ?? $
    },
    text: (text) => {
      parentNode.addChild(new Leaf(text))
      return params?.getSuperChain() ?? $
    },
  }

  // Define Internal Methods
  const builderInternal = $ as any as BuilderInternal<Block>
  builderInternal._ = {
    node: parentNode,
  }

  return $
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
  const builderInternal = $ as any as BuilderInternal
  builderInternal._ = {
    node: parentNode,
  }
  return $
}

const createTableBuilder = (): TableBuilder => {
  const parentNode = new Table()
  const $: TableBuilder = {
    set: (parameters) => {
      parentNode.setParameters(parameters)
      return $
    },
    row: (...cells) => {
      const cellsNormalized = cells.map((cell) =>
        typeof cell === `string`
          ? new Block(new Leaf(cell))
          : cell instanceof Block
          ? cell
          : (cell as any as BuilderInternal<Block>)._.node
      )
      parentNode.rows.push(cellsNormalized)
      return $
    },
    rows: (...rows) => {
      const rowsNormalized = rows.map((cells) =>
        cells.map((cell) =>
          typeof cell === `string`
            ? new Block(new Leaf(cell))
            : cell instanceof Block
            ? cell
            : (cell as any as BuilderInternal<Block>)._.node
        )
      )
      parentNode.rows.push(...rowsNormalized)
      return $
    },
    headers: (headers) => {
      parentNode.headers = headers.map((_) => (_ instanceof Block ? _ : new Block(new Leaf(_))))
      return $
    },
    header: (header) => {
      if (header !== null) {
        parentNode.headers.push(header instanceof Block ? header : new Block(new Leaf(header)))
      }
      return $
    },
  }
  // Define Internal Methods
  const builderInternal = $ as any as BuilderInternal
  builderInternal._ = {
    node: parentNode,
  }
  return $
}

export const createRootBuilder = (parameters?: BlockParameters): RootBuilder => {
  const builder = createBlockBuilder({ getSuperChain: () => builder }) as RootBuilder

  builder.render = () => {
    const builderInternal = builder as any as BuilderInternal<Block>
    const node = builderInternal._.node
    const block = new Block(parameters ?? {}, node)
    const value = block.render({ maxWidth: parameters?.maxWidth ?? process.stdout.columns ?? 100 }).value
    const value2 = Text.mapLines(value, (_) => _.replace(/\s+$/, ``))
    return value2
  }

  return builder
}
