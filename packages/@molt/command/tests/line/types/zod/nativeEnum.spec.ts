import { Command } from '../../../../src/index.js'
import { expect, it } from 'vitest'
import { z } from 'zod'

it(`works`, () => {
  const args = Command.create()
    .parameter(`a`, z.nativeEnum({ a: 1, b: 2 } as const))
    .settings({ onError: `throw` })
    .parse({ line: [`-a`, `1`] })
  expect(args).toMatchObject({ a: 1 })
})
