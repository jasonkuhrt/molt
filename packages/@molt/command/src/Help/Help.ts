import { partition } from '../lib/prelude.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'

// TODO use
interface Settings {
  /**
   * Should parameter names be displayed with dash prefixes.
   * @defaultValue false
   */
  flagDash?: boolean
}

export const render = (specs: ParameterSpec.Spec[], _settings?: Settings) => {
  const [requiredSpecs, optionalSpecs] = partition(
    specs.filter((_) => _.name.canonical !== `help`),
    (spec) => spec.optional
  )

  const columnWidths = {
    name: specs.reduce((width, spec) => Math.max(width, spec.name.canonical.length), 0),
    typeAndDescription: specs.reduce(
      (width, spec) => Math.max(width, spec.schemaPrimitive.length, (spec.description ?? ``).length),
      0
    ),
  }

  let help = ``
  help += title(`PARAMETERS`)
  help += line(``)

  if (requiredSpecs.length > 0) {
    help += line(sectionTitle(`required`))
    for (const spec of requiredSpecs) {
      help += line(``)
      help += parameter(spec, { columnWidths })
      help += line(``)
    }
    help += line(``)
  }

  if (optionalSpecs.length > 0) {
    help += line(sectionTitle(`optional`))
    for (const spec of optionalSpecs) {
      help += line(``)
      help += parameter(spec, { columnWidths })
      help += line(``)
    }
  }

  return help
}

const parameter = (
  spec: ParameterSpec.Spec,
  options: {
    columnWidths: {
      name: number
      typeAndDescription: number
    }
  }
): string => {
  return renderColumns(
    [
      {
        lines: [spec.name.canonical, spec.name.aliases.long.join(`, `), spec.name.aliases.long.join(`, `)],
        width: options.columnWidths.name,
      },
      {
        lines: [spec.schemaPrimitive, spec.description],
        width: options.columnWidths.typeAndDescription,
      },
    ].map((_) => ({
      lines: _.lines.filter((_): _ is string => _ !== null && _ !== ``),
      width: _.width,
    }))
  )
  // let str = ``
  // str += span()
  // if (spec.default) {
  //   str += spec.default.get()
  // }
  // str += line(``)
  // str += span(options.columns.name, ``)
  // if (spec.description) {
  //   str += span(options.columns.typeDescription)
  // }

  // return line(str)
}

const title = (string: string) => {
  return line(underline(string))
}

const underline = (string: string) => {
  return line(string) + `-`.repeat(string.length)
}

const sectionTitle = (title: string) => {
  const border = `--------------------------------`
  return `${border}${title.toLowerCase()}${border}`
}

const line = (text: string) => `${text}\n`

const space = ` `
const newline = `\n`

// const span = (size: number, text: string) => {
//   const paddingSize = size - text.length
//   if (paddingSize < 0) {
//     return toLines(size, text).join(newline)
//   }
//   return pad(`right`, paddingSize, space, text)
// }

const pad = (side: 'left' | 'right', size: number, char: string, text: string) => {
  return side === `left` ? char.repeat(size) + text : text + char.repeat(size)
}

// const toLines = (size: number, text: string): string[] => {
//   const lines = []
//   let textToConsume = text
//   while (textToConsume.length > 0) {
//     lines.push(textToConsume.slice(0, size))
//     textToConsume = textToConsume.slice(size)
//   }
//   return lines
// }

const renderColumns = (columns: { lines: string[]; width?: number }[]) => {
  const columnsSized = columns.map((_) => {
    return {
      lines: _.lines,
      width: _.width ?? _.lines.reduce((width, line) => Math.max(width, line.length), 0),
    }
  })
  const lineCount = Math.max(...columns.map((_) => _.lines.length))
  const columnSeparator = space.repeat(3)
  let currentLine = 0
  const lines = []
  while (currentLine < lineCount) {
    const line = columnsSized
      .map((col) => span(`left`, col.width, col.lines[currentLine] ?? ``))
      // .map((col) => col.lines[currentLine] ?? ``)
      .join(columnSeparator)
    lines.push(line)
    currentLine++
  }
  return lines.join(newline)
}

const span = (side: 'left' | 'right', width: number, content: string) => {
  return pad(side === `left` ? `right` : `left`, Math.max(0, width - content.length), space, content)
  // return pad(side, width - content.length, space, content)
}
