import { Command } from '../src/_entrypoints/default.js'
import { Zod } from '../src/_entrypoints/extensions.js'
import semverRegex from 'semver-regex'
import { z } from 'zod'

const args = Command.create()
  .use(Zod)
  .parameter(`githubToken`, z.string())
  .parameter(`publish`, z.boolean().default(true))
  .parameter(`githubRelease`, z.boolean().default(true))
  .parameter(`p package`, z.enum([`@molt/command`, `@molt/types`, `molt`]))
  .parametersExclusive(`method`, (__) =>
    __.parameter(`v version`, z.string().regex(semverRegex()))
      .parameter(`b bump`, z.enum([`major`, `minor`, `patch`])))
  .settings({
    parameters: {
      environment: {
        githubToken: { prefix: false },
      },
    },
  })
  .parse()

args.method
