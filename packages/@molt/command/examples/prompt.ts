import { Command } from '../src/index.js'
import { z } from 'zod'

const args = await Command.create()
  .parameter(`alpha`, z.string())
  .parameter(`bravo`, z.number())
  .parameter(`charlie`, z.boolean())
  .settings({ prompt: true })
  .parse()

console.log()
console.log(args)
