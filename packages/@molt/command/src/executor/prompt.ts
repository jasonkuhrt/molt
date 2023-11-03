import type { Prompter } from '../lib/Prompter/index.js'
import { Tex } from '../lib/Tex/index_.js'
import { Text } from '../lib/Text/index.js'
import { Term } from '../term.js'
import type { ParseProgressPostPrompt, ParseProgressPostPromptAnnotation } from './parse.js'
import chalk from 'chalk'
import { Effect } from 'effect'

/**
 * Get args from the user interactively via the console for the given parameters.
 */
export const prompt = (
  parseProgress: ParseProgressPostPromptAnnotation,
  prompter: null | Prompter.Prompter,
): Effect.Effect<never, never, ParseProgressPostPrompt> =>
  Effect.gen(function* (_) {
    if (prompter === null) return parseProgress as ParseProgressPostPrompt

    const args: Record<string, any> = {}
    const parameterSpecs = Object.entries(parseProgress.basicParameters)
      .filter((_) => _[1].prompt.enabled)
      .map((_) => _[1].spec)
    const indexTotal = parameterSpecs.length
    let indexCurrent = 1
    const gutterWidth = String(indexTotal).length * 2 + 3

    for (const param of parameterSpecs) {
      // prettier-ignore
      const question = Tex({ flow: `horizontal`})
        .block({ padding: { right: 2 }}, `${Term.colors.dim(`${indexCurrent}/${indexTotal}`)}`)
        .block((__) =>
          __.block(Term.colors.positive(param.name.canonical) +  `${param.optionality._tag === `required` ? `` : chalk.dim(` optional (press esc to skip)`)}`)
            .block((param.description && Term.colors.dim(param.description)) ?? null)
        )
      .render()
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const asking = prompter.ask({
          question,
          prompt: `❯ `,
          marginLeft: gutterWidth,
          parameter: param,
        })
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const arg = yield* _(asking)
        const validationResult = param.type.validate(arg)
        if (validationResult._tag === `Right`) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          args[param.name.canonical] = validationResult.right
          prompter.say(``) // newline
          indexCurrent++
          break
        } else {
          prompter.say(
            Text.pad(
              `left`,
              gutterWidth,
              ` `,
              Term.colors.alert(`Invalid value: ${validationResult.left.errors.join(`, `)}`),
            ),
          )
        }
      }
    }

    // todo do not mutate
    const parseProgressPostPrompt = parseProgress as ParseProgressPostPrompt
    for (const [parameterName, arg] of Object.entries(args)) {
      parseProgressPostPrompt.basicParameters[parameterName]!.prompt.arg = arg // eslint-disable-line
    }

    return parseProgressPostPrompt
  })
