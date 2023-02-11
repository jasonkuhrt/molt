import { groupBy } from '../lib/prelude.js'
import { Tex } from '../lib/Tex/index.js'
import { Block } from '../lib/Tex/nodes.js'
import { Text } from '../lib/Text/index.js'
import { ZodHelpers } from '../lib/zodHelpers/index.js'
import type { ParameterSpec } from '../ParameterSpec/index.js'
import type { Settings } from '../Settings/index.js'
import { chalk } from '../singletons/chalk.js'
import camelCase from 'lodash.camelcase'
import snakeCase from 'lodash.snakecase'
import type { z } from 'zod'

const colors = {
  mute: (text: string) => chalk.grey(text),
  dim: (text: string) => chalk.dim(chalk.grey(text)),
  accent: (text: string) => chalk.yellow(text),
  alert: (text: string) => chalk.red(text),
  alertBoldBg: (text: string) => chalk.bgRedBright(text),
  positiveBold: (text: string) => chalk.bold(colors.positive(text)),
  positive: (text: string) => chalk.green(text),
  secondary: (text: string) => chalk.blue(text),
}

type SomeEnumType = z.ZodEnum<[string, ...string[]]>

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

  const mexGroups = Object.values(groupBy(specsByKind.Exclusive ?? [], (_) => _.group.label)).map(
    (_) => _[0]!.group // eslint-disable-line
  )

  const noteItems: (Tex.Block | string | null)[] = []

  if (isAcceptsAnyEnvironmentArgs) {
    noteItems.push(environmentNote(allSpecsWithoutHelp, settings))
  }

  if (isAcceptsAnyMutuallyExclusiveParameters) {
    noteItems.push(
      `This is a set of mutually exclusive parameters. Only one can be provided at a time. If more than one is provided, execution will fail with an input error.`
    )
  }

  const output = Tex.Tex({ maxWidth: 82, padding: { bottom: 0, top: 0 } })
    .block({ padding: { top: 1, bottom: 1 } }, title(`PARAMETERS`))
    .block({ padding: { left: 2 } }, (__) =>
      __.table({ separators: { column: `   `, row: null } }, (__) =>
        __.header({ padding: { right: 2, bottom: 1 } }, chalk.underline(colors.mute(columnTitles.name)))
          .header(
            {
              minWidth: 8,
              padding: { right: 5 },
            },
            chalk.underline(colors.mute(columnTitles.typeDescription))
          )
          .header({ padding: { right: 4 } }, chalk.underline(colors.mute(columnTitles.default)))
          .header(columnTitles.environment ? chalk.underline(colors.mute(columnTitles.environment)) : null)
          .rows(
            ...[
              ...basicAndUnionSpecsWithoutHelp.map((spec) => [
                parameterName(spec),
                Tex.block(
                  { maxWidth: 40, padding: { right: 9, bottom: 1 } },
                  parameterTypeAndDescription(spec)
                ),
                Tex.block({ maxWidth: 24 }, parameterDefault(spec)),
                ...(isEnvironmentEnabled ? [parameterEnvironment(spec, settings)] : []),
              ]),
              ...mexGroups.flatMap((mexGroup) => {
                const default_ =
                  mexGroup.optionality._tag === `default`
                    ? `${mexGroup.optionality.tag}@${String(mexGroup.optionality.getValue())}`
                    : mexGroup.optionality._tag === `optional`
                    ? `undefined`
                    : labels.required
                return [
                  [
                    Tex.block(
                      { border: { left: colors.dim(`┌`) } },
                      colors.dim(`─${mexGroup.label} ${`(2)`}`)
                    ),
                    ``,
                    default_,
                  ],
                  ...Object.values(mexGroup.parameters).map((spec) => [
                    parameterName(spec),
                    parameterTypeAndDescription(spec),
                    parameterDefault(spec),
                    ...(isEnvironmentEnabled ? [parameterEnvironment(spec, settings)] : []),
                  ]),
                  [Tex.block({ border: { left: colors.dim(`└`) } }, colors.dim(`─`))],
                ]
              }),
            ]
          )
      ).block({ color: colors.dim }, ($) => {
        if (noteItems.length === 0) {
          return null
        }
        return $.block({ padding: { top: 1 }, border: { bottom: `━` }, width: `100%` }, `NOTES`).list(
          {
            bullet: {
              graphic: (index) => `(${index + 1})`,
            },
          },
          noteItems
        )
      })
    )
    .render()

  return output
}

const environmentNote = (specs: ParameterSpec.Output[], settings: Settings.Output) => {
  const isHasSpecsWithCustomEnvironmentNamespace =
    specs
      .filter((_) => _.environment?.enabled)
      .filter(
        (_) =>
          _.environment!.namespaces.filter((_) =>
            settings.parameters.environment.$default.prefix.map(camelCase).includes(_)
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

  content += `Examples:`

  const examples = specs
    .filter((_) => _.environment?.enabled)
    .slice(0, 3)
    .map((_) =>
      _.environment!.namespaces.length > 0
        ? `${colors.secondary(Text.toEnvarNameCase(_.environment!.namespaces[0]!) + `_`)}${colors.positive(
            Text.toEnvarNameCase(_.name.canonical)
          )}`
        : colors.positive(Text.toEnvarNameCase(_.name.canonical))
    )
    .map((_) => `${_}="..."`)

  return Tex.block(($) =>
    $.text(content).block({ padding: { left: 2 } }, ($) =>
      $.list(
        {
          // TODO
          // padding: { left: 2 },
          bullet: {
            graphic: Text.chars.arrowRight,
          },
        },
        examples
      )
    )
  )
}

const parameterDefault = (spec: ParameterSpec.Output) => {
  if (spec._tag === `Exclusive`) {
    return colors.dim(`–`)
  }

  if (spec.optionality._tag === `optional`) {
    return colors.secondary(`undefined`)
  }

  if (spec.optionality._tag === `default`) {
    try {
      return colors.secondary(String(spec.optionality.getValue()))
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      return chalk.bold(colors.alert(`Error trying to render this default: ${error.message}`))
    }
  }

  return labels.required
}

const labels = {
  required: chalk.bold(chalk.black(colors.alertBoldBg(` REQUIRED `))),
}

const parameterName = (spec: ParameterSpec.Output) => {
  const isRequired =
    ((spec._tag === `Basic` || spec._tag === `Union`) && spec.optionality._tag === `required`) ||
    (spec._tag === `Exclusive` && spec.group.optionality._tag === `required`)

  const parameters: Tex.BlockParameters =
    spec._tag === `Exclusive`
      ? {
          border: {
            left: (lineNumber) =>
              lineNumber === 0 ? colors.accent(`◒ `) : colors.dim(`${Text.chars.borders.vertical} `),
          },
        }
      : {
          padding: {
            bottom: 1,
          },
        }

  return Tex.block(parameters, (__) =>
    __.block(isRequired ? colors.positiveBold(spec.name.canonical) : colors.positive(spec.name.canonical))
      .block(colors.dim(spec.name.aliases.long.join(`, `)) || null)
      .block(colors.dim(spec.name.short ?? ``) || null)
      .block(colors.dim(spec.name.aliases.long.join(`, `)) || null)
  )
}

const parameterTypeAndDescription = (spec: ParameterSpec.Output) => {
  if (spec._tag === `Union`) {
    const unionMemberIcon = colors.accent(`◒`)
    const isOneOrMoreMembersWithDescription = spec.types.some((_) => _.description !== null)
    if (isOneOrMoreMembersWithDescription) {
      const types = spec.types.flatMap((_) => {
        const maybeZodEnum = ZodHelpers.getEnum(_.type)
        return Tex.block(
          {
            padding: { bottomBetween: 1 },
            border: {
              left: (index) => `${index === 0 ? unionMemberIcon : colors.dim(Text.chars.borders.vertical)} `,
            },
          },
          (__) =>
            __.block(maybeZodEnum ? typeEnum(_.type as any) : colors.positive(_.typePrimitiveKind)).block(
              _.description
            )
        )
      })
      return Tex.block((__) =>
        __.block(colors.dim(Text.chars.borders.leftTop + Text.chars.borders.horizontal + `union`))
          .block(
            { padding: { bottom: 1 }, border: { left: `${colors.dim(Text.chars.borders.vertical)} ` } },
            spec.description
          )
          .block(types)
          .block(colors.dim(Text.chars.borders.leftBottom + Text.chars.borders.horizontal))
      )
    } else {
      const types = spec.types.map((_) => _.typePrimitiveKind).join(` | `)
      return Tex.block(($) => $.block(types).block(spec.description ?? null))
    }
  }

  const maybeZodEnum = ZodHelpers.getEnum(spec.zodType)
  return Tex.block({ padding: { bottom: spec._tag === `Exclusive` ? 0 : 1 } }, ($) =>
    $.block(maybeZodEnum ? typeEnum(maybeZodEnum) : colors.positive(spec.typePrimitiveKind)).block(
      spec.description ?? null
    )
  )
}

const parameterEnvironment = (spec: ParameterSpec.Output, settings: Settings.Output) => {
  return spec.environment?.enabled
    ? colors.secondary(Text.chars.check) +
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
          : ``)
    : colors.dim(Text.chars.x)
}

/**
 * Render an enum type into a column.
 */
const typeEnum = (schema: SomeEnumType) => {
  const separator = colors.accent(` ${Text.chars.pipe} `)
  const members = Object.values(schema.Values)
  const lines = members.map((member) => colors.positive(member)).join(separator)

  // eslint-disable-next-line
  return members.length > 1 ? lines : `${lines} ${colors.dim(`(enum)`)}`
}

const title = (string: string) => {
  return Text.line(string.toUpperCase())
}
