import { groupBy } from '../lib/prelude.js'
import { Tex } from '../lib/Tex/index.js'
import { Text } from '../lib/Text/index.js'
import { lines } from '../lib/Text/Text.js'
import { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { Settings } from '../Settings/index.js'
import { chalk } from '../singletons/chalk.js'
import camelCase from 'lodash.camelcase'
import snakeCase from 'lodash.snakecase'
import stripAnsi from 'strip-ansi'
import type { z } from 'zod'

const colors = {
  dim: (text: string) => chalk.dim(chalk.grey(text)),
  accent: (text: string) => chalk.yellow(text),
  alert: (text: string) => chalk.red(text),
  alertBoldBg: (text: string) => chalk.bgRedBright(text),
  positiveBold: (text: string) => chalk.bold(colors.positive(text)),
  positive: (text: string) => chalk.green(text),
  secondary: (text: string) => chalk.blue(text),
}

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
  specs_: ParameterSpec.Output[],
  settings: Settings.Output,
  _settings?: RenderSettings
) => {
  const allSpecs = specs_
  const specsWithDescription = allSpecs.filter((_) => _.description !== null)
  const specsByKind = groupBy(specs_, `_tag`)
  const basicAndUnionSpecs = [...(specsByKind.Basic ?? []), ...(specsByKind.Union ?? [])] ?? []
  const allSpecsWithoutHelp = allSpecs
    .filter((_) => _.name.canonical !== `help`)
    .sort((_) =>
      _._tag === `Exclusive`
        ? _.group.optionality._tag === `optional`
          ? 1
          : -1
        : _.optionality._tag === `optional`
        ? 1
        : -1
    )

  const basicAndUnionSpecsWithoutHelp = basicAndUnionSpecs
    .filter((_) => _.name.canonical !== `help`)
    .sort((_) => (_.optionality._tag === `optional` ? 1 : -1))
  const isAcceptsAnyEnvironmentArgs = basicAndUnionSpecs.filter((_) => _.environment?.enabled).length > 0
  const isAcceptsAnyMutuallyExclusiveParameters =
    (specsByKind.Exclusive && specsByKind.Exclusive.length > 0) || false
  const isEnvironmentEnabled =
    Object.values(settings.parameters.environment).filter((_) => _.enabled).length > 0

  const columnTitles = {
    name: `Name`,
    typeDescription: specsWithDescription.length > 0 ? `Type/Description` : `Type`,
    default: `Default`,
    environment: isEnvironmentEnabled ? `Environment (1)` : null,
  }

  const minimumColumnWidthForDefault = columnTitles.default.length
  const columnWidthForEnvironment = 40
  const mutuallyExclusiveGroups = Object.values(
    specsByKind.Exclusive?.reduce((groups, parameter) => {
      groups[parameter.group.label] = parameter.group
      return groups
    }, {} as Record<string, ParameterSpec.Output.ExclusiveGroup>) ?? {}
  )

  const mexGroups = Object.values(groupBy(specsByKind.Exclusive ?? [], (_) => _.group.label)).map(
    (_) => _[0]!.group // eslint-disable-line
  )

  const output = Tex.Tex({ maxWidth: 80 })
    .block({ padding: { top: 1, bottom: 1 } }, title(`PARAMETERS`))
    .block(
      (__) =>
        __.set({ padding: { left: 2 } })
          .table((__) =>
            __.set({ separators: { column: ` `, row: ` ` } })
              .header(columnTitles.name)
              .header(columnTitles.typeDescription)
              .header(columnTitles.default)
              .header(columnTitles.environment)
              .rows(
                ...basicAndUnionSpecsWithoutHelp.map((spec) => [
                  new Tex.Block(Text.fromLines(parameterName(spec))),
                  new Tex.Block(Text.fromLines(parameterTypeAndDescription(spec))),
                  new Tex.Block(Text.fromLines(parameterDefault(spec))),
                  // ...(isEnvironmentEnabled ? [new Tex.Block(parameterEnvironment(spec,settings))] : []),
                ])
              )
          )
          .block(($) => {
            const items = []

            if (isAcceptsAnyEnvironmentArgs) {
              items.push(environmentNote(allSpecsWithoutHelp, settings))
            }

            if (isAcceptsAnyMutuallyExclusiveParameters) {
              items.push(
                `This is a set of mutually exclusive parameters. Only one can be provided at a time. If more than one is provided, execution will fail with an input error.`
              )
            }

            if (items.length === 0) {
              return null
            }

            return $.block({ border: { bottom: `_` }, width: `100%` }, `NOTES`) //.list(items)
          })
      // .data([
      //   ...basicAndUnionSpecsWithoutHelp.map((spec) =>
      //     Tex.row()
      //       .col(parameterName(spec))
      //       .col(parameterTypeAndDescription(spec))
      //       .col(parameterDefault(spec))
      //       .col(isEnvironmentEnabled ? parameterEnvironment(spec) : null)
      //   ),
      //   ...mexGroups.map((mexGroup) =>
      //     Tex.rowGroup({
      //       border: {
      //         left: (info) => {
      //           info.sectionLineNumber // 0
      //           info.sectionKind // 'header' | 'row' | 'footer'
      //         },
      //       },
      //     })
      //       .header((h) => h.col(mexGroup.label, { span: 2 }).col(`...default...`, { span: 2 }))
      //       .data(
      //         Object.values(mexGroup.parameters).map((spec) =>
      //           Tex.row()
      //             .col(parameterName(spec))
      //             .col(parameterTypeAndDescription(spec))
      //             .col(parameterDefault(spec))
      //             .col(parameterEnvironment(spec), { if: isEnvironmentEnabled })
      //         )
      //       )
      //   ),
      // ]),
    )
    .render()

  return output
}

const environmentNote = (specs: ParameterSpec.Output[], settings: Settings.Output): string[] => {
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
        settings.parameters.environment.$default.prefix.map((_) =>
          colors.secondary(Text.toEnvarNameCase(_) + `_`)
        )
      )} (case insensitive), though some parameters deviate (shown in docs). `
    } else {
      content += `They must be prefixed with`
      content += ` ${Text.joinListEnglish(
        settings.parameters.environment.$default.prefix.map((_) =>
          colors.secondary(Text.toEnvarNameCase(_) + `_`)
        )
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
          `${colors.secondary(Text.toEnvarNameCase(_.environment?.namespaces[0]!) + `_`)}${colors.positive(
            Text.toEnvarNameCase(_.name.canonical)
          )}`
        : colors.positive(Text.toEnvarNameCase(_.name.canonical))
    )
    .map((_) => `${_}="..."`)
    .reduce((_, example) => _ + `\n  ${Text.chars.arrowRight} ${example}`, ``)}.`

  return Text.lines(76, content)
}

const basicAndUnionParameters = (
  specs: ParameterSpec.Output[],
  settings: Settings.Output,
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
  groups: ParameterSpec.Output.ExclusiveGroup[],
  settings: Settings.Output,
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
    const header = Text.row([
      {
        lines: [colors.dim(Text.chars.borders.leftTop + Text.chars.borders.horizontal + g.label + ` (2)`)],
        width: widthToDefaultCol,
      },
      {
        lines: [
          g.optionality._tag === `default`
            ? `${g.optionality.tag}@${String(g.optionality.getValue())}`
            : g.optionality._tag === `optional`
            ? `undefined`
            : labels.required,
        ],
      },
    ])

    t += header
    t += Text.chars.newline
    for (const spec of Object.values(g.parameters)) {
      t += Text.indentBlockWith(parameter(spec, settings, options), (_, index) =>
        index === 0 ? colors.accent(`◒ `) : colors.dim(`${Text.chars.borders.vertical} `)
      )
      t += Text.chars.newline
    }
    t += colors.dim(Text.chars.borders.leftBottom + Text.chars.borders.horizontal)
    t += Text.chars.newline
  }
  return t
}

const parameter = (
  spec: ParameterSpec.Output,
  settings: Settings.Output,
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
        lines: parameterTypeAndDescription(spec),
        ...options.columnSpecs.typeAndDescription,
      },
      {
        lines: parameterDefault(spec),
        ...options.columnSpecs.default,
      },
      ...(options.isEnvironmentEnabled ? [{ lines: parameterEnvironment(spec, settings) }] : []),
    ].map((_) => ({
      ..._,
      lines: _.lines.filter((_): _ is string => _ !== null && stripAnsi(_) !== ``),
    }))
  )
}

const parameterDefault = (spec: ParameterSpec.Output): Text.Column => {
  if (spec._tag === `Exclusive`) {
    return [colors.dim(`–`)]
  }

  if (spec.optionality._tag === `optional`) {
    return [colors.secondary(`undefined`)]
  }

  if (spec.optionality._tag === `default`) {
    try {
      return [colors.secondary(String(spec.optionality.getValue()))]
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      return [chalk.bold(colors.alert(`Error trying to render this default: ${error.message}`))]
    }
  }

  return [labels.required]
}

const labels = {
  required: chalk.bold(chalk.black(colors.alertBoldBg(` REQUIRED `))),
}

const parameterName = (spec: ParameterSpec.Output): Text.Column => {
  return [
    ((spec._tag === `Basic` || spec._tag === `Union`) && spec.optionality._tag === `required`) ||
    (spec._tag === `Exclusive` && spec.group.optionality._tag === `required`)
      ? colors.positiveBold(spec.name.canonical)
      : colors.positive(spec.name.canonical),
    colors.dim(spec.name.aliases.long.join(`, `)),
    colors.dim(spec.name.short ?? ``),
    colors.dim(spec.name.aliases.long.join(`, `)),
  ]
}

const parameterTypeAndDescription = (spec: ParameterSpec.Output): Text.Column => {
  if (spec._tag === `Union`) {
    const unionMemberIcon = colors.accent(`◒`)
    const isOneOrMoreMembersWithDescription = spec.types.some((_) => _.description !== null)
    if (isOneOrMoreMembersWithDescription) {
      const types = spec.types.flatMap((_) => {
        const maybeZodEnum = ZodHelpers.getEnum(_.type)
        return [
          unionMemberIcon +
            ` ` +
            // eslint-disable-next-line
            (maybeZodEnum ? typeEnum(_.type as any).join(` | `) : colors.positive(_.typePrimitiveKind)),
          _.description ? colors.dim(Text.chars.borders.vertical) + ` ` + _.description : ``,
          colors.dim(Text.chars.borders.vertical) + ` `,
        ]
      })
      types.pop() // We don't want a trailing empty line
      const desc = spec.description ? colors.dim(Text.chars.borders.vertical) + ` ` + spec.description : ``
      const descSpacer = desc ? `${colors.dim(Text.chars.borders.vertical)} ` : ``
      const typesWithHeaderAndFooter = [
        colors.dim(Text.chars.borders.leftTop + Text.chars.borders.horizontal + `union`),
        desc,
        descSpacer,
        ...types,
        colors.dim(Text.chars.borders.leftBottom + Text.chars.borders.horizontal),
      ]
      return typesWithHeaderAndFooter
    } else {
      const types = spec.types.map((_) => _.typePrimitiveKind).join(` | `)
      return [types, spec.description ?? ``]
    }
  }

  const maybeZodEnum = ZodHelpers.getEnum(spec.zodType)
  return [
    ...(maybeZodEnum ? typeEnum(maybeZodEnum) : [colors.positive(spec.typePrimitiveKind)]),
    spec.description ?? ``,
  ]
}

const parameterEnvironment = (spec: ParameterSpec.Output, settings: Settings.Output): Text.Column => {
  return spec.environment?.enabled
    ? [
        colors.secondary(Text.chars.check) +
          (spec.environment.enabled && spec.environment.namespaces.length === 0
            ? ` ` + colors.dim(Text.toEnvarNameCase(spec.name.canonical))
            : spec.environment.enabled &&
              spec.environment.namespaces.filter(
                // TODO settings normalized should store prefix in camel case
                (_) => !settings.parameters.environment.$default.prefix.includes(snakeCase(_))
              ).length > 0
            ? ` ` +
              colors.dim(
                spec.environment.namespaces
                  .map((_) => `${Text.toEnvarNameCase(_)}_${Text.toEnvarNameCase(spec.name.canonical)}`)
                  .join(` ${Text.chars.pipe} `)
              )
            : ``),
      ]
    : [colors.dim(Text.chars.x)]
}

/**
 * Render an enum type into a column.
 */
const typeEnum = (schema: SomeEnumType): Text.Column => {
  const separator = colors.accent(` ${Text.chars.pipe} `)
  const members = Object.values(schema.Values)
  const lines = columnFitEnumDoc(30, members).map((line) =>
    line.map((member) => colors.positive(member)).join(separator)
  )

  // eslint-disable-next-line
  return members.length > 1 ? lines : [`${lines[0]!} ${colors.dim(`(enum)`)}`]
}

/**
 * Split an enum type across lines in accordance with fitting into a column width.
 * The members are not flattened but kept as an array of members, hence the nested array
 * data structure.
 */
const columnFitEnumDoc = (width: number, members: string[]): string[][] => {
  const separator = ` ${Text.chars.pipe} `
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
