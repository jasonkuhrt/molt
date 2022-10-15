import { partition } from '../lib/prelude.js'
import { Text } from '../lib/Text/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import { chalk } from '../singletons/chalk.js'
import stripAnsi from 'strip-ansi'

interface ColumnSpecs {
  name: {
    width: number
    padding?: number
  }
  typeAndDescription: {
    width: number
    padding?: number
  }
}

// TODO use
interface Settings {
  /**
   * Should parameter names be displayed with dash prefixes.
   * @defaultValue false
   */
  flagDash?: boolean
  /**
   * Should the help output be colored?
   * @defaultValue true
   */
  color?: boolean
}

export const render = (specs: ParameterSpec.Spec[], _settings?: Settings) => {
  const [requiredSpecs, optionalSpecs] = partition(
    specs.filter((_) => _.name.canonical !== `help`),
    (spec) => spec.optional
  )

  const columnSpecs: ColumnSpecs = {
    name: {
      width: specs.reduce((width, spec) => Math.max(width, spec.name.canonical.length), 0),
    },
    typeAndDescription: {
      width: specs.reduce(
        (width, spec) =>
          Math.min(40, Math.max(width, spec.schemaPrimitive.length, (spec.description ?? ``).length)),
        0
      ),
    },
  }

  let help = Text.line()
  help += title(`PARAMETERS`)
  help += Text.line()

  if (requiredSpecs.length > 0) {
    // help += Text.line(Text.indent(chalk.gray(sectionTitle(`required`))))
    help += Text.indent(parameters(requiredSpecs, { columnSpecs })) + Text.line()
  }

  if (optionalSpecs.length > 0) {
    // help += Text.line(Text.indent(chalk.gray(sectionTitle(`optional`))))
    help += Text.indent(parameters(optionalSpecs, { columnSpecs }))
  }

  return help
}

const parameters = (specs: ParameterSpec.Spec[], options: { columnSpecs: ColumnSpecs }) => {
  let t = ``
  for (const spec of specs) {
    t += Text.line()
    t += parameter(spec, { columnSpecs: options.columnSpecs })
    t += Text.line()
  }
  return t
}

const parameter = (
  spec: ParameterSpec.Spec,
  options: {
    columnSpecs: ColumnSpecs
  }
): string => {
  return Text.columns(
    [
      {
        lines: [
          chalk.green(spec.name.canonical),
          chalk.gray(spec.name.aliases.long.join(`, `)),
          chalk.gray(spec.name.short ?? ``),
          chalk.gray(spec.name.aliases.long.join(`, `)),
        ],
        width: options.columnSpecs.name.width,
      },
      {
        lines: [
          chalk.green(spec.schemaPrimitive),
          ...Text.column(options.columnSpecs.typeAndDescription.width, spec.description ?? ``),
        ],
        width: options.columnSpecs.typeAndDescription.width,
      },
      {
        lines: [!spec.optional ? chalk.bgRedBright(` REQUIRED `) : ``],
      },
    ].map((_) => ({
      lines: _.lines.filter((_): _ is string => _ !== null && stripAnsi(_) !== ``),
      width: _.width,
    }))
  )
}

const title = (string: string) => {
  return Text.line(string.toUpperCase())
}

// const sectionTitle = (title: string) => {
//   const borderLength = 40
//   const borderChar = Text.chars.lineH
//   const border = borderChar.repeat(borderLength)
//   return `${border}${title.toLowerCase()}${border}`
// }
