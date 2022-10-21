import { Command } from '../src/index.js'
import { z } from 'zod'

const args = Command.create({
  '--file-path': z.string().describe(`Path to the file to convert.`),
  '--to': z.enum([`json`, `yaml`, `toml`]).describe(`Format to convert to.`),
  '--from': z
    .enum([`json`, `yaml`, `toml`])
    .optional()
    .describe(`Format to convert from. By default inferred from the file extension.`),
  '--verbose -v': z.boolean().default(false).describe(`Log detailed progress as conversion executes.`),
  '--move -m': z.boolean().default(false).describe(`Delete the original file after it has been converted.`),
}).parse()

args.filePath
args.from
args.move
args.to
args.verbose
