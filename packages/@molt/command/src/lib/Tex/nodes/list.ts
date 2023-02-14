import { Text } from '../../Text/index.js'
import { Block } from './block.js'
import type { RenderContext } from './helpers.js'
import { Leaf } from './leaf.js'
import { Node } from './node.js'

export class List extends Node {
  items: Block[]
  parameters: ListParameters
  constructor(items?: (string | Block | null)[]) {
    const items_ = items?.map((_) => (typeof _ === `string` ? new Block(new Leaf(_)) : _)) ?? []
    super()
    this.items = items_.filter((_): _ is Block => _ !== null)
    this.parameters = {}
  }
  setParameters(parameters: ListParameters) {
    this.parameters = parameters
    return this
  }
  render(context: RenderContext) {
    const bullet = {
      graphic: this.parameters.bullet?.graphic ?? `*`,
      align: {
        horizontal: this.parameters.bullet?.align?.horizontal ?? `left`,
      },
    }
    const bullets = ` `
      .repeat(this.items.length)
      .split(` `)
      .map((_, index) => (typeof bullet.graphic === `function` ? bullet.graphic(index) : bullet.graphic))
    const gutterWidth = Math.max(...bullets.map(Text.getLength))
    const gutterWidthWithSpacing = gutterWidth + 1
    const context_ = {
      ...context,
      maxWidth: (context.maxWidth ?? 1000) - gutterWidthWithSpacing,
    }
    const items = this.items.map((item) => item.render(context_).value)
    const value = items
      .map((_, index) => {
        return Text.joinColumns(
          [[Text.minSpan(bullet.align.horizontal, gutterWidth, bullets[index]!)], Text.toLines(_)],
          ` `
        )
      })
      .join(Text.chars.newline)
    const lines = items.flatMap(Text.toLines)
    const intrinsicWidth = Math.max(...lines.map(Text.getLength))
    const intrinsicHeight = lines.length
    return {
      shape: {
        intrinsicWidth,
        intrinsicHeight,
        desiredWidth: null,
      },
      value: value,
    }
  }
}

export interface ListParameters {
  bullet?: {
    graphic?: string | ((index: number) => string)
    align?: {
      horizontal?: 'left' | 'right'
    }
  }
}
