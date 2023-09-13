import { Command } from '../../../../src/index.js'
import { it } from 'vitest'
import { z } from 'zod'

it(`static supports zod types`, () => {
  Command.parameter(`x`, z.literal(1))
  Command.parameter(`x`, z.literal(`1`))
  Command.parameter(`x`, z.literal(true))
})
