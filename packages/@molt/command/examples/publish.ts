import { Zod } from '../src/entrypoints/extensions.js'
import { Command } from '../src/index.js'
import semverRegex from 'semver-regex'
import { z } from 'zod'

const args = Command.create()
  .use(Zod)
  .parameter(`githubToken`, z.string())
  .parameter(`publish`, z.boolean().default(true))
  .parameter(`githubRelease`, z.boolean().default(true))
  .parameter(`p package`, z.enum([`@molt/command`, `@molt/types`, `molt`]))
  .parametersExclusive(`method`, (__) =>
    // prettier-ignore
    __.parameter(`v version`, z.string().regex(semverRegex()))
      .parameter(`b bump`, z.enum([`major`, `minor`, `patch`])),
  )
  .settings({
    parameters: {
      environment: {
        githubToken: { prefix: false },
      },
    },
  })
  .parse()

args.method
