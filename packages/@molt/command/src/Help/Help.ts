import { partitionByTag } from '../lib/prelude.js'
import { Text } from '../lib/Text/index.js'
import { column } from '../lib/Text/Text.js'
import { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { Settings } from '../Settings/index.js'
import { chalk } from '../singletons/chalk.js'
import camelCase from 'lodash.camelcase'
import snakeCase from 'lodash.snakecase'
import stringLength from 'string-length'
import stripAnsi from 'strip-ansi'
import type { z } from 'zod'

interface ColumnSpecs {
  name: {
    width: number
    separator?: string
  }
  typeAndDescription: {
    width: number
    separator?: string
  }
  default: {
    width: number
    separator?: string
  }
  environment: {
    width: number
    separator?: string
  }
}

// TODO use
interface RenderSettings {
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

export const render = (
  specs_: ParameterSpec.Normalized[],
  settings: Settings.Normalized,
  _settings?: RenderSettings
) => {
  const specs = partitionByTag(specs_).Basic ?? []
  const specsWithoutHelp = specs.filter((_) => _.name.canonical !== `help`).sort((_) => (_.optional ? 1 : -1))
  const isAcceptsAnyEnvironmentArgs = specs.filter((_) => _.environment?.enabled).length > 0
  const isEnvironmentEnabled =
    Object.values(settings.parameters.environment).filter((_) => _.enabled).length > 0

  const columnSpecs: ColumnSpecs = {
    name: {
      width: specs.reduce((width, spec) => Math.max(width, spec.name.canonical.length), 0),
    },
    typeAndDescription: {
      width: specs.reduce((width, spec) => {
        const maybeEnum = ZodHelpers.getEnum(spec.type)
        const typeLength = maybeEnum
          ? Math.max(...typeEnum(maybeEnum).map((_) => stripAnsi(_).length))
          : spec.typePrimitiveKind.length
        const descriptionLength = (spec.description ?? ``).length
        const contentWidth = Math.max(width, typeLength, descriptionLength)
        return Math.min(40, contentWidth)
      }, 0),
    },
    default: {
      width: Math.min(
        25,
        specs.reduce(
          (width, spec) => Math.max(width, ...parameterDefault(25, spec).map((_) => stringLength(_))),
          0
        )
      ),
      separator: Text.chars.space.repeat(6),
    },
    environment: {
      width: 40,
    },
  }

  let help = Text.line()
  help += title(`PARAMETERS`)
  help += Text.line()

  help += Text.indent(
    Text.row([
      { lines: [chalk.underline.gray(`Name`)], ...columnSpecs.name },
      { lines: [chalk.underline.gray(`Type/Description`)], ...columnSpecs.typeAndDescription },
      { lines: [chalk.underline.gray(`Default`)], ...columnSpecs.default },
      ...(isEnvironmentEnabled
        ? [
            {
              lines: [
                chalk.underline.gray(
                  `Environment (1)`
                ) /*, chalk.gray.dim(`prefix: CLI_PARAM_* | CLI_PARAMETER_*`) */,
              ],
              ...columnSpecs.environment,
            },
          ]
        : []),
    ])
  )
  help += Text.line()

  if (specsWithoutHelp.length > 0) {
    help += Text.indent(
      parameters(specsWithoutHelp, settings, {
        columnSpecs,
        environment: isAcceptsAnyEnvironmentArgs,
        isEnvironmentEnabled,
      })
    )
  }

  help += Text.line()

  if (isAcceptsAnyEnvironmentArgs) {
    let notes = ``
    notes += `NOTES\n`
    notes += `${Text.chars.lineHBold.repeat(80)}\n`
    notes += Text.row([
      { lines: [`(1) `] },
      { separator: ``, lines: environmentNote(specsWithoutHelp, settings) },
    ])
    help += chalk.gray(Text.indent(notes))
  }

  return help
}

const environmentNote = (specs: ParameterSpec.Normalized[], settings: Settings.Normalized): string[] => {
  const isHasSpecsWithCustomEnvironmentNamespace =
    specs
      .filter((_) => _.environment?.enabled)
      .filter(
        (_) =>
          // eslint-disable-next-line
          _.environment!.namespaces.filter(
            (_) => settings.parameters.environment.$default.prefix.map(camelCase).includes(_)
            // eslint-disable-next-line
          ).length !== _.environment!.namespaces.length
      ).length > 0

  let content = ``

  content +=
    (settings.parameters.environment.$default.enabled ? `Parameters` : `Some parameters (marked in docs)`) +
    ` can be passed arguments via environment variables. Command line arguments take precedence. Environment variable names are snake cased versions of the parameter name (or its aliases), case insensitive. `

  if (settings.parameters.environment.$default.prefix.length > 0) {
    if (isHasSpecsWithCustomEnvironmentNamespace) {
      content += `By default they must be prefixed with`
      content += ` ${Text.joinListEnglish(
        settings.parameters.environment.$default.prefix.map((_) => chalk.blue(Text.toEnvarNameCase(_) + `_`))
      )} (case insensitive), though some parameters deviate (shown in docs). `
    } else {
      content += `They must be prefixed with`
      content += ` ${Text.joinListEnglish(
        settings.parameters.environment.$default.prefix.map((_) => chalk.blue(Text.toEnvarNameCase(_) + `_`))
      )} (case insensitive). `
    }
  } else {
    content += isHasSpecsWithCustomEnvironmentNamespace
      ? `By default there is no prefix, though some parameters deviate (shown in docs). `
      : `There is no prefix.`
  }

  content += `Examples:${specs
    .filter((_) => _.environment?.enabled)
    .slice(0, 3)
    .map((_) =>
      // eslint-disable-next-line
      _.environment!.namespaces.length > 0
        ? // eslint-disable-next-line
          `${chalk.blue(Text.toEnvarNameCase(_.environment?.namespaces[0]!) + `_`)}${chalk.green(
            Text.toEnvarNameCase(_.name.canonical)
          )}`
        : chalk.green(Text.toEnvarNameCase(_.name.canonical))
    )
    .map((_) => `${_}="..."`)
    .reduce((_, example) => _ + `\n  ${Text.chars.arrowR} ${example}`, ``)}.`

  return Text.column(76, content)
}

const parameters = (
  specs: ParameterSpec.Normalized.Basic[],
  settings: Settings.Normalized,
  options: {
    columnSpecs: ColumnSpecs
    environment: boolean
    isEnvironmentEnabled: boolean
  }
) => {
  let t = ``
  for (const spec of specs) {
    t += Text.line()
    t += parameter(spec, settings, {
      isEnvironmentEnabled: options.isEnvironmentEnabled,
      columnSpecs: options.columnSpecs,
    })
    t += Text.line()
  }
  return t
}

const parameter = (
  spec: ParameterSpec.Normalized.Basic,
  settings: Settings.Normalized,
  options: {
    columnSpecs: ColumnSpecs
    isEnvironmentEnabled: boolean
  }
): string => {
  const maybeZodEnum = ZodHelpers.getEnum(spec.type)
  return Text.row(
    [
      {
        lines: [
          chalk.green(spec.name.canonical),
          chalk.gray(spec.name.aliases.long.join(`, `)),
          chalk.gray(spec.name.short ?? ``),
          chalk.gray(spec.name.aliases.long.join(`, `)),
        ],
        ...options.columnSpecs.name,
      },
      {
        lines: [
          ...(maybeZodEnum ? typeEnum(maybeZodEnum) : [chalk.green(spec.typePrimitiveKind)]),
          ...Text.column(options.columnSpecs.typeAndDescription.width, spec.description ?? ``),
        ],
        ...options.columnSpecs.typeAndDescription,
      },
      {
        lines: parameterDefault(options.columnSpecs.default.width, spec),
        ...options.columnSpecs.default,
      },
      ...(options.isEnvironmentEnabled
        ? [
            {
              lines: spec.environment?.enabled
                ? [
                    chalk.blue(Text.chars.check) +
                      (spec.environment.enabled && spec.environment.namespaces.length === 0
                        ? ` ` + chalk.gray(Text.toEnvarNameCase(spec.name.canonical))
                        : spec.environment.enabled &&
                          spec.environment.namespaces.filter(
                            // TODO settings normalized should store prefix in camel case
                            (_) => !settings.parameters.environment.$default.prefix.includes(snakeCase(_))
                          ).length > 0
                        ? ` ` +
                          chalk.gray(
                            spec.environment.namespaces
                              .map(
                                (_) =>
                                  `${Text.toEnvarNameCase(_)}_${Text.toEnvarNameCase(spec.name.canonical)}`
                              )
                              .join(` | `)
                          )
                        : ``),
                  ]
                : [chalk.gray(Text.chars.x)],
            },
          ]
        : []),
    ].map((_) => ({
      ..._,
      lines: _.lines.filter((_): _ is string => _ !== null && stripAnsi(_) !== ``),
    }))
  )
}

const parameterDefault = (width: number, spec: ParameterSpec.Normalized.Basic): Text.Lines => {
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

const title = (string: string) => {
  return Text.line(string.toUpperCase())
}
