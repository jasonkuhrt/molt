import { Command } from '../src/index.js'
import { z } from 'zod'

const args = await Command.create()
  .parameter(`alpha`, z.string())
  .parameter(`bravo`, z.number())
  .parameter(`charlie`, z.boolean())
  .parameter(`delta`, z.enum([`echo`, `foxtrot`, `golf`]))
  .parameter(`honda`, z.union([z.string(), z.number(), z.enum([`a`, `b`, `c`])]))
  .settings({ prompt: true })
  .parse()

console.log()
console.log(args)
