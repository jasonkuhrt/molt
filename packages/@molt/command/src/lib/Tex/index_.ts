import { Text } from '../Text/index.js'
import console from 'console'

interface RenderContext {
  maxWidth: number
}

abstract class Node {
  abstract render(context: RenderContext): { shape: Shape; value: string }
}

class Leaf extends Node {
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

interface Shape {
  intrinsicWidth: number
  desiredWidth: number | null
}

interface BlockParameters {
  maxWidth?: number
  padding?: {
    left?: number
  }
}

class Block extends Node {
  children: Node[]
  parameters: BlockParameters
  constructor(parameters: BlockParameters, node: Node)
  constructor(parameters: BlockParameters, nodes: Node[])
  constructor(parameters: BlockParameters, text: string)
  constructor(nodes: Node[])
  constructor(node: Node)
  constructor(text: string)
  constructor(...args: [string | Node | Node[]] | [BlockParameters, string | Node | Node[]]) {
    super()
    const parameters = args.length === 1 ? {} : args[0]
    const children = args.length === 1 ? args[0] : args[1]

    this.parameters = parameters

    if (typeof children === `string`) {
      this.children = [new Leaf(children)]
    } else if (Array.isArray(children)) {
      this.children = children
    } else {
      this.children = [children]
    }
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

function block(parameters: BlockParameters, nodes: Node): Block
function block(parameters: BlockParameters, nodes: Node[]): Block
function block(parameters: BlockParameters, text: string): Block
function block(text: string): Block
function block(nodes: Node[]): Block
function block(...args: [string | Node | Node[]] | [BlockParameters, string | Node | Node[]]): Block {
  // @ts-expect-error
  return new Block(...args)
}

const render = (node: Node): string => {
  return node.render({
    maxWidth: Infinity,
  }).value
}

// testing
console.clear()
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(new Leaf(`hello world`)))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(block(`hello world`)))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(block([block(`a`), block(`b`)])))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(block({ maxWidth: 5 }, `hello world`)))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(
  render(
    block(
      { maxWidth: 10 },
      block([
        block(`adkf slkf saljf sdl`),
        block({ maxWidth: 5, padding: { left: 2 } }, `badkdooidsf dfoi dsfo dspd spdsp df`),
      ])
    )
  )
)

console.log(`---------------------------------------------------------------------------------------------`)
console.log(
  render(
    block({ maxWidth: 80 }, block([block(`PARAMETERS`), block({ padding: { left: 2 } }, [block(`Notes`)])]))
  )
)

// console.log(`---------------------------------------------------------------------------------------------`)
// console.log(
//   Tex({ maxWidth: 80 }).block(($) =>
//     $.block(`PARAMETERS`)
//       .table()
//       .block({ padding: { left: 2 } }.block(`Notes`))
//   )
// )
