import { invertTable } from '../../helpers.js'
import { Text } from '../Text/index.js'
import stringLength from 'string-length'

interface RenderContext {
  maxWidth: number
}

interface Shape {
  intrinsicWidth: number
  desiredWidth: number | null
}

export abstract class Node {
  abstract render(context: RenderContext): { shape: Shape; value: string }
}

export class Leaf extends Node {
  value: string
  constructor(value: string) {
    super()
    this.value = value
  }
  render(context: RenderContext) {
    const value = Text.lines(context.maxWidth, this.value).join(Text.chars.newline)
    // const intrinsicWidth = stringLength(value)
    return {
      shape: {
        intrinsicWidth: 0,
        desiredWidth: null,
      },
      value: value,
    }
  }
}

export class Table extends Node {
  rows: Block[][]
  constructor(rows?: Block[][]) {
    super()
    this.rows = rows ?? []
  }
  addRow(row: Block[]) {
    this.rows.push(row)
  }
  render(context: RenderContext) {
    const graphics = {
      columnDividerHorizontal: ` ${Text.chars.pipe} `,
    }
    const rows = this.rows.map((r) =>
      r.map((c) => {
        return c.render(context).value
      })
    )
    const intrinsicColWidths = invertTable(rows).map((c) => Math.max(...c.map(stringLength)))
    const rowsSized = rows.map((r) =>
      r.map((c, i) => Text.padWithin(`right`, intrinsicColWidths[i] ?? 0, ` `, c))
    )
    const rowsJoined = rowsSized.map((r) => r.join(graphics.columnDividerHorizontal))
    const str = rowsJoined.join(Text.chars.newline)

    return {
      shape: {
        intrinsicWidth: 0,
        desiredWidth: 0,
      },
      value: str,
    }
  }
}

export interface BlockParameters {
  maxWidth?: number
  padding?: {
    left?: number
  }
}

export class Block extends Node {
  children: Node[]
  parameters: BlockParameters
  constructor(parameters: BlockParameters, node: Node)
  constructor(parameters: BlockParameters, nodes: Node[])
  constructor(parameters: BlockParameters, text: string)
  constructor(nodes: Node[])
  constructor(node: Node)
  constructor(text: string)
  constructor()
  constructor(...args: [] | [string | Node | Node[]] | [BlockParameters, string | Node | Node[]]) {
    super()
    const parameters = args.length === 1 || args.length === 0 ? {} : args[0]
    const children = args.length === 0 ? [] : args.length === 1 ? args[0] : args[1]

    this.parameters = parameters

    if (typeof children === `string`) {
      this.children = [new Leaf(children)]
    } else if (Array.isArray(children)) {
      this.children = children
    } else {
      this.children = [children]
    }
  }
  addChild(node: Node) {
    this.children.push(node)
  }
  setParameters(parameters: BlockParameters) {
    this.parameters = parameters
  }
  render(context: RenderContext) {
    const maxWidth =
      Math.min(this.parameters.maxWidth ?? Infinity, context.maxWidth) - (this.parameters.padding?.left ?? 0)
    // let intrinsicWidth = 0
    const renderings: string[] = []

    for (const child of this.children) {
      const rendered = child.render({ maxWidth })
      // intrinsicWidth = 0 //Math.max(intrinsicWidth, rendered.shape.intrinsicWidth)
      renderings.push(rendered.value)
    }

    const joined = renderings.join(Text.chars.newline)

    const value = this.parameters.padding?.left
      ? Text.indentBlock(joined, Text.chars.space.repeat(this.parameters.padding.left))
      : joined

    return {
      shape: {
        intrinsicWidth: 0,
        desiredWidth: 0,
      },
      value,
    }
  }
}
