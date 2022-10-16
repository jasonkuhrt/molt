import { partition } from '../lib/prelude.js'
import { Text } from '../lib/Text/index.js'
import { column } from '../lib/Text/Text.js'
import { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import { chalk } from '../singletons/chalk.js'
import snakeCase from 'lodash.snakecase'
import stripAnsi from 'strip-ansi'
import type { z } from 'zod'

interface ColumnSpecs {
  name: {
    width: number
    padding?: number
  }
  typeAndDescription: {
    width: number
    padding?: number
  }
  default: {
    width: number
    padding?: number
  }
  environment: {
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
  const specsWithoutHelp = specs.filter((_) => _.name.canonical !== `help`)
  const [requiredSpecs, optionalSpecs] = partition(specsWithoutHelp, (spec) => spec.optional)

  const columnSpecs: ColumnSpecs = {
    name: {
      width: specs.reduce((width, spec) => Math.max(width, spec.name.canonical.length), 0),
    },
    typeAndDescription: {
      width: specs.reduce((width, spec) => {
        const maybeEnum = ZodHelpers.getEnum(spec.schema)
        const typeLength = maybeEnum
          ? Math.max(...typeEnum(maybeEnum).map((_) => stripAnsi(_).length))
          : spec.schemaPrimitive.length
        const descriptionLength = (spec.description ?? ``).length
        const contentWidth = Math.max(width, typeLength, descriptionLength)
        return Math.min(40, contentWidth)
      }, 0),
    },
    default: {
      width: 25,
    },
    environment: {
      width: 40,
    },
  }

  let help = Text.line()
  help += title(`PARAMETERS`)
  help += Text.line()

  if (requiredSpecs.length > 0) {
    help += Text.indent(parameters(requiredSpecs, { columnSpecs }))
  }

  if (optionalSpecs.length > 0) {
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
  const maybeZodEnum = ZodHelpers.getEnum(spec.schema)
  return Text.row(
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
          ...(maybeZodEnum ? typeEnum(maybeZodEnum) : [chalk.green(spec.schemaPrimitive)]),
          ...Text.column(options.columnSpecs.typeAndDescription.width, spec.description ?? ``),
        ],
        width: options.columnSpecs.typeAndDescription.width,
      },
      {
        lines: parameterDefault(options.columnSpecs.default.width, spec),
        separator: Text.chars.space.repeat(6),
        width: options.columnSpecs.default.width,
      },
      {
        lines: spec.environment?.enabled
          ? [
              chalk.blue(Text.chars.check) +
                ` ${chalk.gray(
                  spec.environment.namespaces.length > 0
                    ? spec.environment.namespaces
                        .map(
                          (_) =>
                            `${snakeCase(_).toUpperCase()}_${snakeCase(spec.name.canonical).toUpperCase()}`
                        )
                        .join(` | `)
                    : `${snakeCase(spec.name.canonical).toUpperCase()}`
                )}`,
            ]
          : [chalk.gray(Text.chars.x)],
      },
    ].map((_) => ({
      ..._,
      lines: _.lines.filter((_): _ is string => _ !== null && stripAnsi(_) !== ``),
    }))
  )
}

const parameterDefault = (width: number, spec: ParameterSpec.Spec): Text.Lines => {
  if (spec.optional) {
    if (spec.default) {
      try {
        return [chalk.blue(String(spec.default.get()))]
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))
        return column(width, `Error trying to render this default: ${error.message}`).map((_) =>
          chalk.bold(chalk.red(_))
        )
      }
    }
    return [chalk.blue(`undefined`)]
  }
  return [chalk.bold(chalk.black(chalk.bgRedBright(` REQUIRED `)))]
}

const typeEnum = (schema: z.ZodEnum<[string, ...string[]]>): Text.Lines => {
  const separator = chalk.yellow(` | `)
  const members = Object.values(schema.Values)
  const lines = columnFitEnumDoc(30, members).map((line) =>
    line.map((member) => chalk.green(member)).join(separator)
  )

  // eslint-disable-next-line
  return members.length > 1 ? lines : [`${lines[0]!} ${chalk.gray(`(enum)`)}`]
}

const columnFitEnumDoc = (width: number, members: string[]): string[][] => {
  const separator = ` | `
  const lines: string[][] = []
  let currentLine: string[] = []

  for (const member of members) {
    const currentLineWidth = currentLine.reduce(
      (length, member, index) =>
        index === 0 ? length + member.length : length + member.length + separator.length,
      0
    )
    if (currentLineWidth > width && currentLine.length != 0) {
      lines.push(currentLine)
      currentLine = []
    } else {
      currentLine.push(member)
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine)
  }

  return lines
}

// const sectionTitle = (title: string) => {
//   const borderLength = 40
//   const borderChar = Text.chars.lineH
//   const border = borderChar.repeat(borderLength)
//   return `${border}${title.toLowerCase()}${border}`
// }

const title = (string: string) => {
  return Text.line(string.toUpperCase())
}
