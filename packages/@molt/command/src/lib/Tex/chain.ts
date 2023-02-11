import type { BlockParameters, ListParameters, Node, TableParameters } from './index_.js'
import { List } from './index_.js'
import { Leaf, Table } from './index_.js'
import { Block } from './index_.js'

// prettier-ignore
export interface BlockBuilder<Chain = null> {
  block: BlockMethod<Chain extends null ? BlockBuilder : Chain>

  table(rows: Block[][])                                                        : Chain extends null ? BlockBuilder : Chain
  table(builder: ($: TableBuilder) => null|TableBuilder)                        : Chain extends null ? BlockBuilder : Chain

  list(parameters: ListParameters, nodeishes: (string|Block)[])                 : Chain extends null ? BlockBuilder : Chain
  list(nodeishes: (string|Block)[])                                             : Chain extends null ? BlockBuilder : Chain
  list(builder: ($: ListBuilder) => null|ListBuilder)                           : Chain extends null ? BlockBuilder : Chain
  
  text(text: string)                                                            : Chain extends null ? BlockBuilder : Chain

  set(parameters: BlockParameters)                                              : Chain extends null ? BlockBuilder : Chain
}

interface BlockMethod<Chain> {
  (builder: ($: BlockBuilder) => null | BlockBuilder): Chain
  (children: (string | null | RootBuilder | BlockBuilder | Block)[]): Chain
  (child: string | null | RootBuilder | BlockBuilder | Block): Chain
  (parameters: BlockParameters, child: Block | BlockBuilder | RootBuilder | string | null): Chain
  (parameters: BlockParameters, children: (Block | BlockBuilder | RootBuilder | string | null)[]): Chain
}

type blockMethodArgs =
  | [BlockParameters, Block | string | null | BlockBuilder | RootBuilder]
  | [BlockParameters, (Block | string | null | BlockBuilder | RootBuilder)[]]
  | [Block | string | null | BlockBuilder | RootBuilder]
  | [(Block | string | null | BlockBuilder | RootBuilder)[]]
  | [BlockImplementor]

type BlockImplementor = ($: BlockBuilder) => null | BlockBuilder

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
  }
}

const resolveBlockMethodArgs = (
  args: blockMethodArgs
): { parameters: BlockParameters | null; child: Block | null } => {
  const parameters = args.length === 1 ? null : args[0]
  const childrenInput = args.length === 1 ? args[0] : args[1]
  let child: null | Block | BlockImplementor = null
  if (childrenInput) {
    if (typeof childrenInput === `string`) {
      child = new Block(new Leaf(childrenInput))
    } else if (childrenInput instanceof Block) {
      child = childrenInput
    } else if (typeof childrenInput === `function`) {
      child = childrenInput
      const result = childrenInput(createRootBuilder())
      child = result === null ? result : toInternalBuilder(result)._.node
    } else if (Array.isArray(childrenInput)) {
      child = new Block(
        childrenInput
          .map((_) =>
            _ === null
              ? null
              : _ instanceof Block
              ? _
              : typeof _ === `string`
              ? new Leaf(_)
              : toInternalBuilder(_)?._.node ?? null
          )
          .filter((_): _ is Block => _ !== null)
      )
    } else {
      child = toInternalBuilder(childrenInput)._.node
    }
  }
  return { parameters, child }
}

const createBlockBuilder = (params?: { getSuperChain: () => any }): BlockBuilder => {
  const parentNode = new Block()
  // let parentParameters: = parameters ?? {}

  const $: BlockBuilder = {
    block: (...args: blockMethodArgs) => {
      const input = resolveBlockMethodArgs(args)
      if (input.child) {
        if (input.parameters) {
          input.child.setParameters(input.parameters)
        }
        parentNode.addChild(input.child)
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
          ? toInternalBuilder(rows(createTableBuilder()))?._.node ?? null
          : new Table(rows)
      if (node) {
        parentNode.addChild(node)
      }
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
          ? toInternalBuilder(nodeishes(createListBuilder()))?._.node ?? null
          : new List(nodeishes.map((_) => (typeof _ === `string` ? new Block(new Leaf(_)) : _)))
      if (node) {
        parentNode.addChild(node)
        if (parameters) {
          node.setParameters(parameters)
        }
      }
      return params?.getSuperChain() ?? $
    },
    text: (text) => {
      parentNode.addChild(new Leaf(text))
      return params?.getSuperChain() ?? $
    },
  }

  // Define Internal Methods
  const builderInternal = toInternalBuilder($)
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
  toInternalBuilder($)._ = {
    node: parentNode,
  }
  return $
}

export interface TableBuilder {
  set(parameters: TableParameters): TableBuilder
  row(...cells: (BlockBuilder | RootBuilder | Block | string | null)[]): TableBuilder
  rows(...rows: (null | (BlockBuilder | RootBuilder | Block | string | null)[])[]): TableBuilder
  headers(headers: (string | Block)[]): TableBuilder
  header: BlockMethod<TableBuilder>
}

const createTableBuilder = (): TableBuilder => {
  const parentNode = new Table()
  const $: TableBuilder = {
    set: (parameters) => {
      parentNode.setParameters(parameters)
      return $
    },
    row: (...cells) => {
      const cellsNormalized = cells
        .filter((cell): cell is string | RootBuilder | BlockBuilder<null> | Block => cell !== null)
        .map((cell) =>
          typeof cell === `string`
            ? new Block(new Leaf(cell))
            : cell instanceof Block
            ? cell
            : toInternalBuilder(cell)._.node
        )
      if (cellsNormalized.length > 0) {
        parentNode.rows.push(cellsNormalized)
      }
      return $
    },
    rows: (...rows) => {
      const rowsNormalized = rows
        .filter((_): _ is (string | BlockBuilder<null> | Block | RootBuilder | null)[] => _ !== null)
        .map((cells) =>
          cells
            .filter((cell): cell is string | BlockBuilder | Block | RootBuilder => cell !== null)
            .map((cell) =>
              typeof cell === `string`
                ? new Block(new Leaf(cell))
                : cell instanceof Block
                ? cell
                : toInternalBuilder(cell)._.node
            )
        )

      if (rowsNormalized.length > 0) {
        parentNode.rows.push(...rowsNormalized)
      }
      return $
    },
    headers: (headers) => {
      parentNode.headers = headers.map((_) => (_ instanceof Block ? _ : new Block(new Leaf(_))))
      return $
    },
    header: (...args: blockMethodArgs) => {
      const input = resolveBlockMethodArgs(args)
      if (input.child) {
        if (input.parameters) {
          input.child.setParameters(input.parameters)
        }
        parentNode.headers.push(input.child)
      }
      return $
    },
  }
  // Define Internal Methods
  toInternalBuilder($)._ = {
    node: parentNode,
  }
  return $
}

export const createRootBuilder = (parameters?: BlockParameters): RootBuilder => {
  const builder = createBlockBuilder({ getSuperChain: () => builder }) as RootBuilder
  const builderInternal = toInternalBuilder(builder)
  builderInternal._.node.setParameters({
    maxWidth: process.stdout.columns,
    ...parameters,
  })

  builder.render = () => render(builder)

  return builder
}

export type Builder = RootBuilder | BlockBuilder | TableBuilder | ListBuilder

export const render = (builder: Builder): string => {
  const result = toInternalBuilder(builder)._.node.render({
    index: {
      isFirst: true,
      isLast: true,
      position: 0,
      total: 1,
    },
  })
  return result.value
}

export const block = (...args: blockMethodArgs) => {
  const input = resolveBlockMethodArgs(args)
  if (input.child && input.parameters) {
    input.child.setParameters(input.parameters)
  }
  return input.child
}

// prettier-ignore
const toInternalBuilder = <Builder extends BlockBuilder<null>|TableBuilder|ListBuilder|null>(builder: Builder):
  Builder extends null               ? null                   :
  Builder extends BlockBuilder<null> ? BuilderInternal<Block> :
  Builder extends TableBuilder       ? BuilderInternal<Table> :
  Builder extends ListBuilder        ? BuilderInternal<List>  :
                                       never => 
  builder as any
