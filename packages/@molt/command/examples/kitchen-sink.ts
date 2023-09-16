import { Command } from '../src/index.js'
import { z } from 'zod'

const args = Command.create()
  .description(
    `This is a so-called "kitchen-sink" Molt Command example. Many features are demonstrated here though the overall CLI itself makes no sense. Take a look around, see how the help renders, try running with different inputs, etc.`,
  )
  .parameter(
    `badDefault`,
    z.string().default(() => {
      throw new Error(`whoops`)
    }),
  )
  .parameter(`one`, z.enum([`apple`]))
  .parameter(`figbar`, z.enum([`zebra`, `monkey`, `giraffe`]).default(`monkey`))
  .parameter(
    `big`,
    z
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
  )
  .parameter(
    `i install`,
    z
      .union([
        z.boolean().describe(`Use the system-detected package manager.`),
        z.enum([`yarn`, `npm`, `pnpm`]).describe(`Force use of a specific package manager.`),
      ])
      .describe(`Run dependency install after setup.`)
      .default(false),
  )
  .parameter(`filePath`, z.string().describe(`Path to the file to convert.`))
  .parameter(`to`, z.enum([`json`, `yaml`, `toml`]).describe(`Format to convert to.`))
  .parameter(
    `from`,
    z
      .enum([`json`, `yaml`, `toml`])
      .optional()
      .describe(`Format to convert from. By default inferred from the file extension.`),
  )
  .parameter(
    `verbose v`,
    z.boolean().default(false).describe(`Log detailed progress as conversion executes.`),
  )
  .parameter(
    `move m`,
    z.boolean().default(false).describe(`Delete the original file after it has been converted.`),
  )
  .parametersExclusive(`desert`, (_) =>
    _.parameter(
      `cake`,
      z
        .enum([`chocolate`, `vanilla`, `strawberry`])
        .describe(`An indulgent treat to celebrate peak moments in life!`),
    ).parameter(
      `fruit`,
      z
        .enum([`apple`, `banana`, `orange`])
        .describe(`A sustainable snack for everyday happiness and delight!`),
    ),
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
args.desert
args.from
args.move
args.to
args.verbose
