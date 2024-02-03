/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @param {NS} ns */
export function main (ns) {
  const target = ns.args[0]
  const paths = { home: '' }
  const queue = Object.keys(paths)
  let name
  let output
  let pathToTarget

  while ((name = queue.shift())) {
    const path = paths[name]
    const scanRes = ns.scan(name)

    for (const newSv of scanRes) {
      if (paths[newSv] === undefined) {
        queue.push(newSv)
        paths[newSv] = `${path},${newSv}`
        if (newSv === target) { pathToTarget = paths[newSv].substr(1).split(',') }
      }
    }
  }
  output = 'home; '

  pathToTarget.forEach(server => { output += ' connect ' + server + ';' })

  const terminalInput = document.getElementById('terminal-input')

  terminalInput.value = output
  const handler = Object.keys(terminalInput)[1]

  terminalInput[handler].onChange({ target: terminalInput })
  terminalInput[handler].onKeyDown({ keyCode: 13, preventDefault: () => null })
}
