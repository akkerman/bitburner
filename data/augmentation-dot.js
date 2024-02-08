const fs = require('node:fs')
const exec = require('node:child_process').exec
const readline = require('node:readline')

function main () {
  const rl = readline.createInterface({ input: process.stdin })
  const dotFile = fs.createWriteStream('./augmentations.dot')

  dotFile.write('digraph {\n')

  rl.on('line', augmentation => {
    augmentation = JSON.parse(augmentation.toString())
    if (!augmentation.prerequisites) {
      // dotFile.write(`"${augmentation.name}" -> nothing;\n`)
      return
    }

    // for (const preq of augmentation.prerequisites) {
    //   dotFile.write(`"${preq}" -> "${augmentation.name}";\n`)
    // }

    dotFile.write(`"${augmentation.prerequisites.at(-1)}" -> "${augmentation.name}";\n`)
  })

  rl.on('close', () => {
    dotFile.write('}\n')
    dotFile.end()

    exec('dot augmentations.dot -T svg > augmentations.svg')
  })
}

main()
