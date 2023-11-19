import { groupBy } from '../lib/prelude.js'
import { Tex } from '../lib/Tex/index.js'
import { Text } from '../lib/Text/index.js'
import type { Parameter } from '../Parameter/types.js'
import type { Settings } from '../Settings/index.js'
import { Term } from '../term.js'
import chalk from 'chalk'
import camelCase from 'lodash.camelcase'
import snakeCase from 'lodash.snakecase'

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

export const render = (parameters_: Parameter[], settings: Settings.Output, _settings?: RenderSettings) => {
  const allParameters = parameters_
  const parametersWithDescription = allParameters.filter((_) => _.type.description !== null)
  const parametersByTag = groupBy(parameters_, `_tag`)
  const basicParameters = parametersByTag.Basic ?? []
  const allParametersWithoutHelp = allParameters
    .filter((_) => _.name.canonical !== `help`)
    .sort((_) =>
      _._tag === `Exclusive`
        ? _.group.optionality._tag === `optional`
          ? 1
          : -1
        : _.type.optionality._tag === `optional`
        ? 1
        : -1,
    )

  const parametersBasicWithoutHelp = basicParameters
    .filter((_) => _.name.canonical !== `help`)
    .sort((_) => (_.type.optionality._tag === `optional` ? 1 : -1))
  const isAcceptsAnyEnvironmentArgs = basicParameters.filter((_) => _.environment?.enabled).length > 0
  const isAcceptsAnyMutuallyExclusiveParameters =
    (parametersByTag.Exclusive && parametersByTag.Exclusive.length > 0) || false
  const isEnvironmentEnabled =
    Object.values(settings.parameters.environment).filter((_) => _.enabled).length > 0

  const columnTitles = {
    name: `Name`,
    typeDescription: parametersWithDescription.length > 0 ? `Type/Description` : `Type`,
    default: `Default`,
    environment: isEnvironmentEnabled ? `Environment (1)` : null,
  }

  const parametersExclusiveGroups = Object.values(
    groupBy(parametersByTag.Exclusive ?? [], (_) => _.group.label),
  ).map(
    (_) => _[0]!.group, // eslint-disable-line
  )

  const noteItems: (Tex.Block | string | null)[] = []

  if (isAcceptsAnyEnvironmentArgs) {
    noteItems.push(environmentNote(allParametersWithoutHelp, settings))
  }

  if (isAcceptsAnyMutuallyExclusiveParameters) {
    noteItems.push(
      `This is a set of mutually exclusive parameters. Only one can be provided at a time. If more than one is provided, execution will fail with an input error.`,
    )
  }

  const output = Tex.Tex({ maxWidth: 82, padding: { bottom: 0, top: 0 } })
    .block(($) => {
      if (!settings.description) return null
      return $.block({ padding: { top: 1, bottom: 1 } }, `ABOUT`).block(
        { padding: { left: 2 } },
        settings.description,
      )
    })
    .block({ padding: { top: 1, bottom: 1 } }, title(`PARAMETERS`))
    .block({ padding: { left: 2 } }, (__) =>
      __.table({ separators: { column: `   `, row: null } }, (__) =>
        __.header({ padding: { right: 2, bottom: 1 } }, chalk.underline(Term.colors.mute(columnTitles.name)))
          .header(
            {
              minWidth: 8,
              padding: { right: 5 },
            },
            chalk.underline(Term.colors.mute(columnTitles.typeDescription)),
          )
          .header({ padding: { right: 4 } }, chalk.underline(Term.colors.mute(columnTitles.default)))
          .header(
            columnTitles.environment ? chalk.underline(Term.colors.mute(columnTitles.environment)) : null,
          )
          .rows([
            ...parametersBasicWithoutHelp.map((parameter) => [
              parameterName(parameter),
              Tex.block({ maxWidth: 40, padding: { right: 9, bottom: 1 } }, parameter.type.help(settings)),
              Tex.block({ maxWidth: 24 }, parameterDefault(parameter)),
              ...(isEnvironmentEnabled ? [parameterEnvironment(parameter, settings)] : []),
            ]),
            ...parametersExclusiveGroups.flatMap((parametersExclusive) => {
              const default_ =
                parametersExclusive.optionality._tag === `default`
                  ? `${parametersExclusive.optionality.tag}@${String(
                      parametersExclusive.optionality.getValue(),
                    )}`
                  : parametersExclusive.optionality._tag === `optional`
                  ? `undefined`
                  : labels.required
              return [
                [
                  Tex.block(
                    { border: { left: Term.colors.dim(`┌`) } },
                    Term.colors.dim(`─${parametersExclusive.label} ${`(2)`}`),
                  ),
                  ``,
                  default_,
                ],
                ...Object.values(parametersExclusive.parameters).map((parameter) => [
                  parameterName(parameter),
                  parameter.type.help(settings),
                  parameterDefault(parameter),
                  ...(isEnvironmentEnabled ? [parameterEnvironment(parameter, settings)] : []),
                ]),
                [Tex.block({ border: { left: Term.colors.dim(`└`) } }, Term.colors.dim(`─`))],
              ]
            }),
          ]),
      ).block({ color: Term.colors.dim }, ($) => {
        if (noteItems.length === 0) {
          return null
        }
        return $.block({ padding: { top: 1 }, border: { bottom: `━` }, width: `100%` }, `NOTES`).list(
          {
            bullet: {
              graphic: (index) => `(${index + 1})`,
            },
          },
          noteItems,
        )
      }),
    )
    .render()

  return output
}

const environmentNote = (parameters: Parameter[], settings: Settings.Output) => {
  const isHasParametersWithCustomEnvironmentNamespace =
    parameters
      .filter((_) => _.environment?.enabled)
      .filter(
        (_) =>
          _.environment!.namespaces.filter((_) =>
            settings.parameters.environment.$default.prefix.map(camelCase).includes(_),
          ).length !== _.environment!.namespaces.length,
      ).length > 0

  let content = ``

  content +=
    (settings.parameters.environment.$default.enabled ? `Parameters` : `Some parameters (marked in docs)`) +
    ` can be passed arguments via environment variables. Command line arguments take precedence. Environment variable names are snake cased versions of the parameter name (or its aliases), case insensitive. `

  if (settings.parameters.environment.$default.prefix.length > 0) {
    if (isHasParametersWithCustomEnvironmentNamespace) {
      content += `By default they must be prefixed with`
      content += ` ${Text.joinListEnglish(
        settings.parameters.environment.$default.prefix.map((_) =>
          Term.colors.secondary(Text.toEnvarNameCase(_) + `_`),
        ),
      )} (case insensitive), though some parameters deviate (shown in docs). `
    } else {
      content += `They must be prefixed with`
      content += ` ${Text.joinListEnglish(
        settings.parameters.environment.$default.prefix.map((_) =>
          Term.colors.secondary(Text.toEnvarNameCase(_) + `_`),
        ),
      )} (case insensitive). `
    }
  } else {
    content += isHasParametersWithCustomEnvironmentNamespace
      ? `By default there is no prefix, though some parameters deviate (shown in docs). `
      : `There is no prefix.`
  }

  content += `Examples:`

  const examples = parameters
    .filter((_) => _.environment?.enabled)
    .slice(0, 3)
    .map((_) =>
      _.environment!.namespaces.length > 0
        ? `${Term.colors.secondary(
            Text.toEnvarNameCase(_.environment!.namespaces[0]!) + `_`,
          )}${Term.colors.positive(Text.toEnvarNameCase(_.name.canonical))}`
        : Term.colors.positive(Text.toEnvarNameCase(_.name.canonical)),
    )
    .map((_) => `${_}="..."`)

  return Tex.block(($) =>
    $.text(content).list(
      {
        padding: { left: 2 },
        bullet: {
          graphic: Text.chars.arrowRight,
        },
      },
      examples,
    ),
  )
}

const parameterDefault = (parameter: Parameter) => {
  if (parameter._tag === `Exclusive`) {
    return Term.colors.dim(`–`)
  }

  if (parameter.type.optionality._tag === `optional`) {
    return Term.colors.secondary(`undefined`)
  }

  if (parameter.type.optionality._tag === `default`) {
    try {
      return Term.colors.secondary(String(parameter.type.optionality.getValue()))
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e))
      return chalk.bold(Term.colors.alert(`Error trying to render this default: ${error.message}`))
    }
  }

  return labels.required
}

const labels = {
  required: chalk.bold(chalk.black(Term.colors.alertBoldBg(` REQUIRED `))),
}

const parameterName = (parameter: Parameter) => {
  const isRequired =
    (parameter._tag === `Basic` && parameter.type.optionality._tag === `required`) ||
    (parameter._tag === `Exclusive` && parameter.group.optionality._tag === `required`)

  const parameters: Tex.BlockParameters =
    parameter._tag === `Exclusive`
      ? {
          border: {
            left: (lineNumber) =>
              lineNumber === 0
                ? Term.colors.accent(`◒ `)
                : Term.colors.dim(`${Text.chars.borders.vertical} `),
          },
        }
      : {
          padding: {
            bottom: 1,
          },
        }

  return Tex.block(parameters, (__) =>
    __.block(
      isRequired
        ? Term.colors.positiveBold(parameter.name.canonical)
        : Term.colors.positive(parameter.name.canonical),
    )
      .block(Term.colors.dim(parameter.name.aliases.long.join(`, `)) || null)
      .block(Term.colors.dim(parameter.name.short ?? ``) || null)
      .block(Term.colors.dim(parameter.name.aliases.long.join(`, `)) || null),
  )
}

const parameterEnvironment = (parameter: Parameter, settings: Settings.Output) => {
  return parameter.environment?.enabled
    ? Term.colors.secondary(Text.chars.check) +
        (parameter.environment.enabled && parameter.environment.namespaces.length === 0
          ? ` ` + Term.colors.dim(Text.toEnvarNameCase(parameter.name.canonical))
          : parameter.environment.enabled &&
            parameter.environment.namespaces.filter(
              // TODO settings normalized should store prefix in camel case
              (_) => !settings.parameters.environment.$default.prefix.includes(snakeCase(_)),
            ).length > 0
          ? ` ` +
            Term.colors.dim(
              parameter.environment.namespaces
                .map((_) => `${Text.toEnvarNameCase(_)}_${Text.toEnvarNameCase(parameter.name.canonical)}`)
                .join(` ${Text.chars.pipe} `),
            )
          : ``)
    : Term.colors.dim(Text.chars.x)
}

const title = (string: string) => {
  return Text.line(string.toUpperCase())
}
