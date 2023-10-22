import { Command } from '../src/index.js'
import { Builder, BuilderState } from '../src/Parameter/constructors/basic.js'
import { Name } from '../src/Parameter/name/index.js'
import { Parameter } from '../src/Parameter/Parameter.js'
import { ParameterInternal } from '../src/Parameter/ParameterInternal.js'
import { Type } from '../src/Type/index.js'
import { TypeAdaptors } from '../src/TypeAdaptors/index.js'
import type { FlagName } from 'packages/@molt/types/build/esm/index.js'
import { z } from 'zod'

// declare const defineInputType: (params: {
//   name: string
//   refinements: {
//     name: string
//     description: string
//     options: { name: string; description: string }[]
//   }[]
//   validate: (refinements, value: string) => boolean
// }) => void

// const filePath = Command.defineInputType({
//   name: `filePath`,
//   type: `string`,
//   refinements: [
//     {
//       name: `existence`,
//       description: `...`,
//       options: [
//         { name: `exists`, description: `...` },
//         { name: `doesNotExist`, description: `` },
//       ],
//     },
//     {
//       name: `direction`,
//       description: `...`,
//       options: [{ name: `relative`, description: `...` }],
//     },
//   ],
//   validate: (refinements, value) => {},
// })
const p = Parameter.basic().name(`bravo2`).description(`...`).type(Type.literal(`bravo2`))
// type x = FlagName.Parse<'bravo'>
// const p2 = ParameterInternal.getBuilderState(p)
// const x = Parameter.basic().name(`bravo`)
const args = Command.create()
  // .addExtension(filePathInputType)
  // // required
  // .parameter(`alpha`, { type: filePath.existence(`exists`).direction(`relative`) })
  // .parameter(`bravo`, z.number())
  // .parameter((p) =>
  //   p
  //     .name(`bravo`)
  //     .description(`abc`)
  //     .type((t) => t.path().file().exists().relative()),
  // )
  .parameter(Parameter.basic().name(`bravo`).description(`...`).type(Type.string()))
  .parameter(
    p, //.type(TypeAdaptors.fromZod(z.string())),
    //   //   // .type(Type.filePath().existence(`exists`).direction(`relative`)),
  )
  // .parameter(`charlie`, z.boolean())
  // .parameter(`delta`, z.enum([`echo`, `foxtrot`, `golf`]))
  // .parameter(`hotel`, z.union([z.string(), z.number(), z.enum([`a`, `b`, `c`])]))
  // // optional
  // .parameter(`india`, z.string().optional())
  // .parameter(`juliet`, z.number().optional())
  // .parameter(`kilo`, z.boolean().optional())
  // .parameter(`lima`, z.enum([`a`, `b`, `c`]).optional())
  // .parameter(`mike`, z.union([z.string(), z.number(), z.enum([`a`, `b`, `c`])]).optional())
  // end
  // .settings({ prompt: { when: [{ result: `rejected` }, { result: `omitted` }] } })
  .parse()

console.log()
console.log(args)
