import { groupBy } from '../lib/prelude.js'
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

type SomeEnumType = z.ZodEnum<[string, ...string[]]>

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
  const allSpecs = specs_
  const specsWithDescription = allSpecs.filter((_) => _.description !== null)
  const specsByKind = groupBy(specs_, `_tag`)
  const basicSpecs = specsByKind.Basic ?? []
  const allSpecsWithoutHelp = allSpecs
    .filter((_) => _.name.canonical !== `help`)
    .sort((_) => (_._tag === `Exclusive` ? (_.group.optional ? 1 : -1) : _.optional ? 1 : -1))

  const basicSpecsWithoutHelp = basicSpecs
    .filter((_) => _.name.canonical !== `help`)
    .sort((_) => (_.optional ? 1 : -1))
  const isAcceptsAnyEnvironmentArgs = basicSpecs.filter((_) => _.environment?.enabled).length > 0
  const isEnvironmentEnabled =
    Object.values(settings.parameters.environment).filter((_) => _.enabled).length > 0

  const columnTitles = {
    name: `Name`,
    typeDescription: specsWithDescription.length > 0 ? `Type/Description` : `Type`,
    default: `Default`,
    environment: isEnvironmentEnabled ? `Environment (1)` : null,
  }

  const columnSpecs: ColumnSpecs = {
    name: {
      width: allSpecs.reduce((width, spec) => Math.max(width, spec.name.canonical.length), 0),
    },
    typeAndDescription: {
      width: allSpecs.reduce((width, spec) => {
        const maybeEnum = ZodHelpers.getEnum(spec.type)
        const typeLength = maybeEnum
          ? Math.max(...typeEnum(maybeEnum).map((_) => stripAnsi(_).length))
          : spec.typePrimitiveKind.length
        const descriptionLength = (spec.description ?? ``).length
        const contentWidth = Math.max(
          width,
          typeLength,
          descriptionLength,
          columnTitles.typeDescription.length
        )
        return Math.min(40, contentWidth)
      }, 0),
    },
    default: {
      width: Math.min(
        25,
        basicSpecs.reduce(
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

  let str = Text.line()

  /**
   * Render header
   */

  str += title(`PARAMETERS`)
  str += Text.line()
  str += Text.indentBlock(
    Text.row([
      { lines: [chalk.underline.gray(columnTitles.name)], ...columnSpecs.name },
      { lines: [chalk.underline.gray(columnTitles.typeDescription)], ...columnSpecs.typeAndDescription },
      { lines: [chalk.underline.gray(columnTitles.default)], ...columnSpecs.default },
      ...(isEnvironmentEnabled
        ? [
            {
              lines: [
                chalk.underline.gray(columnTitles.environment!), // eslint-disable-line
                // /*, chalk.gray.dim(`prefix: CLI_PARAM_* | CLI_PARAMETER_*`) */,
              ],
              ...columnSpecs.environment,
            },
          ]
        : []),
    ])
  )
  str += Text.line()

  /**
   * Render basic parameters
   */

  if (basicSpecsWithoutHelp.length > 0) {
    str += Text.indentBlock(
      basicParameters(basicSpecsWithoutHelp, settings, {
        columnSpecs,
        environment: isAcceptsAnyEnvironmentArgs,
        isEnvironmentEnabled,
      })
    )
  }

  /**
   * Render exclusive parameters
   */

  const groups = Object.values(groupBy(specsByKind.Exclusive ?? [], (_) => _.group.label)).map(
    (_) => _[0]!.group // eslint-disable-line
  )
  if (groups.length > 0) {
    str += exclusiveGroups(groups, settings, {
      columnSpecs,
      environment: isAcceptsAnyEnvironmentArgs,
      isEnvironmentEnabled,
    })
  }
  str += Text.line()

  /**
   * Render Notes
   */

  if (isAcceptsAnyEnvironmentArgs) {
    let notes = ``
    notes += `NOTES\n`
    notes += `${Text.chars.lineHBold.repeat(80)}\n`
    notes += Text.row([
      { lines: [`(1) `] },
      { separator: ``, lines: environmentNote(allSpecsWithoutHelp, settings) },
    ])
    str += chalk.gray(Text.indentBlock(notes))
  }

  return str
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

const basicParameters = (
  specs: ParameterSpec.Normalized[],
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
    t += parameter(spec, settings, options)
    t += Text.line()
  }
  return t
}

const exclusiveGroups = (
  groups: ParameterSpec.Exclusive[],
  settings: Settings.Normalized,
  options: {
    columnSpecs: ColumnSpecs
    environment: boolean
    isEnvironmentEnabled: boolean
  }
) => {
  let t = ``
  for (const g of groups) {
    t += Text.line()
    const widthToDefaultCol =
      (options.columnSpecs.name.separator?.length ?? Text.defaultColumnSeparator.length) +
      options.columnSpecs.name.width +
      (options.columnSpecs.typeAndDescription.separator?.length ?? Text.defaultColumnSeparator.length) +
      options.columnSpecs.typeAndDescription.width +
      `  `.length
    const header = chalk.gray(
      Text.row([
        { lines: [`┌─` + g.label + ` (mutually exclusive)`], width: widthToDefaultCol },
        {
          lines: [
            g.default ? `${g.default.tag}@${g.default.value}` : g.optional ? `undefined` : labels.required,
          ],
        },
      ])
    )
    t += header
    t += Text.line()
    for (const spec of Object.values(g.values)) {
      t += Text.indentBlockWith(parameter(spec, settings, options), (_, index) =>
        index === 0 ? chalk.yellow(`◒ `) : chalk.gray(`│ `)
      )
      t += Text.line()
    }
    t += chalk.gray(`└─`)
    t += Text.line()
  }
  return t
}

const parameter = (
  spec: ParameterSpec.Normalized,
  settings: Settings.Normalized,
  options: {
    columnSpecs: ColumnSpecs
    isEnvironmentEnabled: boolean
  }
): string => {
  return Text.row(
    [
      {
        lines: parameterName(spec),
        ...options.columnSpecs.name,
      },
      {
        lines: parameterTypeAndDescription(spec, options.columnSpecs),
        ...options.columnSpecs.typeAndDescription,
      },
      {
        lines: parameterDefault(options.columnSpecs.default.width, spec),
        ...options.columnSpecs.default,
      },
      ...(options.isEnvironmentEnabled ? [{ lines: parameterEnvironment(spec, settings) }] : []),
    ].map((_) => ({
      ..._,
      lines: _.lines.filter((_): _ is string => _ !== null && stripAnsi(_) !== ``),
    }))
  )
}

const parameterDefault = (width: number, spec: ParameterSpec.Normalized): Text.Column => {
  if (spec._tag === `Exclusive`) return [chalk.gray(`–`)]

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
  return [labels.required]
}

const labels = {
  required: chalk.bold(chalk.black(chalk.bgRedBright(` REQUIRED `))),
}

const parameterName = (spec: ParameterSpec.Normalized): Text.Column => {
  return [
    chalk.green(spec.name.canonical),
    chalk.gray(spec.name.aliases.long.join(`, `)),
    chalk.gray(spec.name.short ?? ``),
    chalk.gray(spec.name.aliases.long.join(`, `)),
  ]
}

const parameterTypeAndDescription = (
  spec: ParameterSpec.Normalized,
  columnSpecs: ColumnSpecs
): Text.Column => {
  const maybeZodEnum = ZodHelpers.getEnum(spec.type)
  return [
    ...(maybeZodEnum ? typeEnum(maybeZodEnum) : [chalk.green(spec.typePrimitiveKind)]),
    ...Text.column(columnSpecs.typeAndDescription.width, spec.description ?? ``),
  ]
}

const parameterEnvironment = (spec: ParameterSpec.Normalized, settings: Settings.Normalized): Text.Column => {
  return spec.environment?.enabled
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
                  .map((_) => `${Text.toEnvarNameCase(_)}_${Text.toEnvarNameCase(spec.name.canonical)}`)
                  .join(` | `)
              )
            : ``),
      ]
    : [chalk.gray(Text.chars.x)]
}

/**
 * Render an enum type into a column.
 */
const typeEnum = (schema: SomeEnumType): Text.Column => {
  const separator = chalk.yellow(` | `)
  const members = Object.values(schema.Values)
  const lines = columnFitEnumDoc(30, members).map((line) =>
    line.map((member) => chalk.green(member)).join(separator)
  )

  // eslint-disable-next-line
  return members.length > 1 ? lines : [`${lines[0]!} ${chalk.gray(`(enum)`)}`]
}

/**
 * Split an enum type across lines in accordance with fitting into a column width.
 * The members are not flattened but kept as an array of members, hence the nested array
 * data structure.
 */
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
