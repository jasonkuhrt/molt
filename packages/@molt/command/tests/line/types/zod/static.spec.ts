import { Command } from '../../../../src/index.js'
import { it } from 'vitest'
import { z } from 'zod'

it(`static supports zod types`, () => {
  Command.create().parameter(`x`, z.literal(1))
  Command.create().parameter(`x`, z.literal(`1`))
  Command.create().parameter(`x`, z.literal(true))
})
