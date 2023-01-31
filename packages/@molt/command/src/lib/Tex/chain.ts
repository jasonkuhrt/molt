import type { BlockParameters, Node } from './index_.js'
import { Leaf, Table } from './index_.js'
import { Block } from './index_.js'

// prettier-ignore
interface BlockBuilder<Chain = null> {
  // block(parameters: BlockParameters, builder: ($: BuilderBase) => BuilderBase)  : Chain extends null ? BuilderBase : Chain
  block(builder: ($: BlockBuilder) => BlockBuilder)                             : Chain extends null ? BlockBuilder : Chain
  block(text: string)                                                           : Chain extends null ? BlockBuilder : Chain
  // block(parameters: BlockParameters, text: string)                           : Chain extends null ? BuilderBase : Chain

  table(rows: Block[][])                                                        : Chain extends null ? BlockBuilder : Chain
  table(builder: ($: TableBuilder) => TableBuilder)                             : Chain extends null ? BlockBuilder : Chain

  set(parameters: BlockParameters)                                              : Chain extends null ? BlockBuilder : Chain
}

interface TableBuilder {
  row(...cells: Block[]): TableBuilder
}

interface RootBuilder extends BlockBuilder<RootBuilder> {
  render(): string
}

interface BuilderInternal {
  _: {
    node: Node
    // parameters: BlockParameters
  }
}

const createBlockBuilder = (params?: { getSuperChain: () => any }): BlockBuilder => {
  const parentNode = new Block()
  // let parentParameters: = parameters ?? {}

  const builder: BlockBuilder = {
    block: (
      ...args: // | [BlockParameters, string]
      | [string]
        // | [BlockParameters, ($: BuilderBase) => BuilderBase]
        | [($: BlockBuilder) => BlockBuilder]
    ) => {
      // const parameters = args.length === 1 ? {} : args[0]
      const content = args[0] // args.length === 1 ? args[0] : args[1]
      const node =
        typeof content === `string`
          ? new Leaf(content)
          : (content(createRootBuilder()) as any as BuilderInternal)._.node
      parentNode.addChild(node)
      return params?.getSuperChain() ?? builder
    },
    set: (parameters: BlockParameters) => {
      parentNode.setParameters(parameters)
      return params?.getSuperChain() ?? builder
    },
    table: (rows) => {
      const node =
        typeof rows === `function`
          ? (rows(createTableBuilder()) as any as BuilderInternal)._.node
          : new Table(rows)
      parentNode.addChild(node)
      return params?.getSuperChain() ?? builder
    },
  }

  // Define Internal Methods
  const builderInternal = builder as any as BuilderInternal
  builderInternal._ = {
    node: parentNode,
  }

  return builder
}

const createTableBuilder = () => {
  const parentNode = new Table()
  const builder: TableBuilder = {
    row: (...cells) => {
      parentNode.addRow(cells)
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
    const builderInternal = builder as any as BuilderInternal
    return builderInternal._.node.render({
      maxWidth: parameters?.maxWidth ?? Infinity,
    }).value
  }

  return builder
}
