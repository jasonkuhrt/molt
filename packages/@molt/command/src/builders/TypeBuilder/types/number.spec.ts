import { describe, expect, expectTypeOf, test } from 'vitest'
import { number } from './number.js'
import { BuilderKit } from '../../../lib/BuilderKit/BuilderKit.js'

const n = number()
const state = BuilderKit.State.get(n)

test.todo(`todo`)
