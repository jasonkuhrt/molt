import { Command } from '../src/index.js'
import { z } from 'zod'

const args = Command.parameters({
  badDefault: z.string().default(() => {
    throw new Error(`whoops`)
  }),
  one: z.enum([`apple`]),
  figbar: z.enum([`zebra`, `monkey`, `giraffe`]).default(`monkey`),
  big: z
    .enum([
      `apple`,
      `baby`,
      `cannabis`,
      `dinosaur`,
      `elephant`,
      `fanna`,
      `goat`,
      `house`,
      `island`,
      `jake`,
      `kilomanjara`,
    ])
    .optional(),
  'i install': z
    .union([
      z.boolean().describe(`Use the system-detected package manager.`),
      z.enum([`yarn`, `npm`, `pnpm`]).describe(`Force use of a specific package manager.`),
    ])
    .describe(`Run dependency install after setup.`)
    .default(false),
  filePath: z.string().describe(`Path to the file to convert.`),
  to: z.enum([`json`, `yaml`, `toml`]).describe(`Format to convert to.`),
  from: z
    .enum([`json`, `yaml`, `toml`])
    .optional()
    .describe(`Format to convert from. By default inferred from the file extension.`),
  'verbose v': z.boolean().default(false).describe(`Log detailed progress as conversion executes.`),
  'move m': z.boolean().default(false).describe(`Delete the original file after it has been converted.`),
})
  .parametersExclusive(`desert`, (_) =>
    _.parameter(
      `cake`,
      z
        .enum([`chocolate`, `vanilla`, `strawberry`])
        .describe(`An indulgent treat to celebrate peak moments in life!`)
    ).parameter(
      `fruit`,
      z
        .enum([`apple`, `banana`, `orange`])
        .describe(`A sustainable snack for everyday happiness and delight!`)
    )
  )
  .settings({
    parameters: {
      environment: {
        // $default: true,
        big: true,
      },
    },
  })
  .parse()

args.filePath
args.from
args.move
args.to
args.verbose
