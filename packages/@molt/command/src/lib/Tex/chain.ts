import type { BlockParameters, Node, TableParameters } from './index_.js'
import { Leaf, Table } from './index_.js'
import { Block } from './index_.js'

// prettier-ignore
export interface BlockBuilder<Chain = null> {
  // block(parameters: BlockParameters, builder: ($: BuilderBase) => BuilderBase)  : Chain extends null ? BuilderBase : Chain
  block(builder: ($: BlockBuilder) => null|BlockBuilder)                        : Chain extends null ? BlockBuilder : Chain
  block(text: string|null)                                                      : Chain extends null ? BlockBuilder : Chain
  block(parameters: BlockParameters, text: string|null)                         : Chain extends null ? BlockBuilder : Chain

  table(rows: Block[][])                                                        : Chain extends null ? BlockBuilder : Chain
  table(builder: ($: TableBuilder) => null|TableBuilder)                        : Chain extends null ? BlockBuilder : Chain
  
  text(text: string)                                                            : Chain extends null ? BlockBuilder : Chain

  set(parameters: BlockParameters)                                              : Chain extends null ? BlockBuilder : Chain
}

export interface TableBuilder {
  set(parameters: TableParameters): TableBuilder
  row(...cells: (Block | string)[]): TableBuilder
  rows(...rows: Block[][]): TableBuilder
  headers(headers: string[]): TableBuilder
  header(header: null | string): TableBuilder
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

  const builder: BlockBuilder = {
    block: (
      ...args:
        | [BlockParameters, string | null]
        | [string | null]
        // | [BlockParameters, ($: BuilderBase) => BuilderBase]
        | [($: BlockBuilder) => null | BlockBuilder]
    ) => {
      const parameters = args.length === 1 ? null : args[0]
      const content = args.length === 1 ? args[0] : args[1]
      if (content) {
        let node: null | Block
        if (typeof content === `string`) {
          node = new Block(new Leaf(content))
        } else {
          const result = content(createRootBuilder())
          node = result === null ? result : (result as any as BuilderInternal<Block>)._.node
        }

        if (node) {
          if (parameters) {
            node.setParameters(parameters)
          }

          parentNode.addChild(node)
        }
      }

      return params?.getSuperChain() ?? builder
    },
    set: (parameters: BlockParameters) => {
      parentNode.setParameters(parameters)
      return params?.getSuperChain() ?? builder
    },
    table: (rows) => {
      const node =
        typeof rows === `function`
          ? (rows(createTableBuilder()) as any as BuilderInternal<Table>)._.node
          : new Table(rows)
      parentNode.addChild(node)
      return params?.getSuperChain() ?? builder
    },
    text: (text) => {
      parentNode.addChild(new Leaf(text))
      return params?.getSuperChain() ?? builder
    },
  }

  // Define Internal Methods
  const builderInternal = builder as any as BuilderInternal<Block>
  builderInternal._ = {
    node: parentNode,
  }

  return builder
}

const createTableBuilder = (): TableBuilder => {
  const parentNode = new Table()
  const builder: TableBuilder = {
    set: (parameters) => {
      parentNode.setParameters(parameters)
      return builder
    },
    row: (...cells) => {
      const cellsNormalized = cells.map((_) => (typeof _ === `string` ? new Block(new Leaf(_)) : _))
      parentNode.rows.push(cellsNormalized)
      return builder
    },
    rows: (...rows) => {
      parentNode.rows.push(...rows)
      return builder
    },
    headers: (headers) => {
      parentNode.headers = headers
      return builder
    },
    header: (header) => {
      if (header !== null) {
        parentNode.headers.push(header)
      }
      return builder
    },
  }
  // Define Internal Methods
  const builderInternal = builder as any as BuilderInternal
  builderInternal._ = {
    node: parentNode,
  }
  return builder
}

export const createRootBuilder = (parameters?: BlockParameters): RootBuilder => {
  const builder = createBlockBuilder({ getSuperChain: () => builder }) as RootBuilder

  builder.render = () => {
    const builderInternal = builder as any as BuilderInternal<Block>
    return builderInternal._.node.render({
      maxWidth: parameters?.maxWidth ?? process.stdout.columns ?? 100,
    }).value
  }

  return builder
}
