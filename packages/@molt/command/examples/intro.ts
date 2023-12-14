import { Command, p, t } from '../src/_entrypoints/default.js'

const args = Command.create()
  .parameters({
    filePath: p.type(t.string().description(`abc`).toCase(`upper`).trim()),
    // .pattern(`ip`, { version: 4 }),
    to: p
      .type(t.enum([`json`, `yaml`, `toml`]))
      .description(`Format to convert to.`),
    // .prompt(),
    // from: p.type(t.enum([`json`, `yaml`, `toml`])).optional(),
    'verbose v': p
      // todo
      // .type(t.boolean())
      .type(t.string()),
    // .default(false)
    // .description(`Log detailed progress as conversion executes.`),
    'move m': p
      // todo
      // .type(t.boolean())
      .type(t.string()),
    // .default(false)
    // .description(`Delete the original file after it has been converted.`),
  })
  //   // .settings({
  //   //   prompt: {
  //   //     // TODO allow making parameter level opt-in or opt-out
  //   //     // default: false,
  //   //     when: [
  //   //       {
  //   //         result: `rejected`,
  //   //         error: `ErrorMissingArgument`,
  //   //       },
  //   //       { result: `omitted` },
  //   //     ],
  //   //   },
  //   // })
  .parse()

args.filePath
args.from
args.move
args.to
args.verbose

// // .parameter(
// //   p
// //     .name(`filePath`)
// //     .type(t.string())
// //     .description(`Path to the file to convert.`),
// // )
// // .parameter(
// //   p
// //     .name(`to`)
// //     .type(t.enum([`json`, `yaml`, `toml`]))
// //     .description(`Format to convert to.`),
// // )
// // .parameter(
// //   p
// //     .name(`from`)
// //     .type(t.enum([`json`, `yaml`, `toml`]))
// //     // todo does not affect args type
// //     .optional(),
// // )
// // .parameter(
// //   p
// //     .name(`verbose v`)
// //     .type(t.boolean())
// //     // .default(false)
// //     .description(`Log detailed progress as conversion executes.`),
// // )
// // .parameter(
// //   p
// //     .name(`move m`)
// //     .type(t.boolean())
// //     // .default(false)
// //     .description(`Delete the original file after it has been converted.`),
// // )
