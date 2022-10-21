import { Command } from '../src/index.js'
import semverRegex from 'semver-regex'
import { z } from 'zod'

const args = Command.create({
  'p package': z.enum([`@molt/command`, `@molt/types`, `molt`]),
  'v version': z.string().regex(semverRegex()).optional(),
  'b bump': z.enum([`major`, `minor`, `patch`]).optional(),
  publish: z.boolean().default(true),
  githubRelease: z.boolean().default(true),
  githubToken: z.string(),
})
  .settings({
    parameters: {
      environment: {
        githubToken: { prefix: false },
      },
    },
  })
  .parse()

args.bump
