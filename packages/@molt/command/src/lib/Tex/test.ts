import { Tex } from './index.js'
import type { BlockParameters, Node } from './index_.js'
import { Block, Leaf, Table } from './index_.js'

const render = (node: Node): string => {
  return node.render({
    maxWidth: Infinity,
  }).value
}

function block(parameters: BlockParameters, nodes: Node): Block
function block(parameters: BlockParameters, nodes: Node[]): Block
function block(parameters: BlockParameters, text: string): Block
function block(text: string): Block
function block(): Block
function block(nodes: Node[]): Block
function block(...args: [] | [string | Node | Node[]] | [BlockParameters, string | Node | Node[]]): Block {
  // @ts-expect-error
  return new Block(...args)
}

console.clear()
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(new Leaf(`hello world`)))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(block(`hello world`)))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(block([block(`a`), block(`b`)])))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(render(block({ maxWidth: 5 }, `hello world`)))
console.log(`---------------------------------------------------------------------------------------------`)

console.log(
  render(
    block(
      { maxWidth: 10 },
      block([
        block(`adkf slkf saljf sdl`),
        block({ maxWidth: 5, padding: { left: 2 } }, `badkdooidsf dfoi dsfo dspd spdsp df`),
      ])
    )
  )
)

console.log(`---------------------------------------------------------------------------------------------`)
console.log(
  render(
    block(
      { maxWidth: 80 },
      block([
        block(`PARAMETERS`),
        block({ padding: { left: 2 } }, [
          new Table([
            [block(`r1c1 asdf sdf`), block(`r1c2 a34`), block(`r1c3 sadfv sd`)],
            [block(`r2c1 ad=303- sdf;bb`), block(`r2c2 sdf  2 xxx`), block(`r2c3 32 - -sdf -`)],
          ]),
          block(`Notes`),
        ]),
      ])
    )
  )
)

console.log(`---------------------------------------------------------------------------------------------`)
console.log(
  Tex({ maxWidth: 80 })
    .block((__) =>
      __.block(`PARAMETERS`).block((__) =>
        __.set({ padding: { left: 2 } })
          .table((__) =>
            __.row(block(`r1c1 asdf sdf`), block(`r1c2 a34`), block(`r1c3 sadfv sd`))
              .row(block(`r2c1 ad=303- sdf;bb`), block(`r2c2 sdf  2 xxx`), block(`r2c3 32 - -sdf -`))
              .row(block(`r2c1 ad=303- sdf;bb`), block(`r2c2 sdf  2 xxx`), block(`r2c3 32 - -sdf -`))
          )
          .block(`Notes`)
      )
    )
    .render()
)
