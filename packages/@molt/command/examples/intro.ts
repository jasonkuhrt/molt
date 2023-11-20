import { z } from 'zod'
import { Command } from '../src/_entrypoints/default.js'
import { Zod } from '../src/_entrypoints/extensions.js'

const args = await Command.create()
  .use(Zod)
  .parameter(`filePath`, z.string().describe(`Path to the file to convert.`))
  .parameter(`to`, z.enum([`json`, `yaml`, `toml`]).describe(`Format to convert to.`))
  .parameter(`from`, z.enum([`json`, `yaml`, `toml`]).optional())
  .parameter(
    `verbose v`,
    z.boolean().default(false).describe(`Log detailed progress as conversion executes.`),
  )
  .parameter(
    `move m`,
    z.boolean().default(false).describe(`Delete the original file after it has been converted.`),
  )
  .settings({
    prompt: {
      // TODO allow making parameter level opt-in or opt-out
      // default: false,
      when: [
        {
          result: `rejected`,
          error: `ErrorMissingArgument`,
        },
        { result: `omitted` },
      ],
    },
  })
  .parse()
