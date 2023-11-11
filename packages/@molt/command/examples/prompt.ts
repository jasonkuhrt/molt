import { Zod } from '../src/entrypoints/extensions.js'
import { Command } from '../src/index.js'
import { z } from 'zod'

const args = await Command.create()
  .use(Zod)
  // required
  .parameter(`alpha`, z.string())
  .parameter(`bravo`, z.number())
  .parameter(`charlie`, z.boolean())
  .parameter(`delta`, z.enum([`echo`, `foxtrot`, `golf`]))
  .parameter(`hotel`, z.union([z.string(), z.number(), z.enum([`a`, `b`, `c`])]))
  // optional
  .parameter(`india`, z.string().optional())
  .parameter(`juliet`, z.number().optional())
  .parameter(`kilo`, z.boolean().optional())
  .parameter(`lima`, z.enum([`a`, `b`, `c`]).optional())
  .parameter(`mike`, z.union([z.string(), z.number(), z.enum([`a`, `b`, `c`])]).optional())
  // end
  .settings({ prompt: { when: [{ result: `rejected` }, { result: `omitted` }] } })
  .parse()

console.log()
console.log(args)
