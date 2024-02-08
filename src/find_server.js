/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @param {NS} ns */
export function main (ns) {
  const doc = eval('document') // eslint-disable-line 
  const start = ns.getHostname()
  const search = ns.args[0]

  const rgx = new RegExp(search, 'ig')

  const visited = new Set()
  const queue = [{ server: start, path: [] }]

  let node

  let cmd = null

  while ((node = queue.shift())) {
    const { server, path } = node

    if (server.match(rgx)) {
      const p = path.concat([server]).join('; connect ')
      const idx = p.indexOf(';')

      cmd = p.slice(idx + 1)
      break
    }
    if (visited.has(server)) { continue }
    visited.add(server)

    const newPath = path.concat([server])

    for (const neigbour of ns.scan(server)) {
      queue.push({ server: neigbour, path: newPath })
    }
  }
  if (cmd) {
    const terminalInput = doc.getElementById('terminal-input')

    terminalInput.value = cmd
    const handler = Object.keys(terminalInput)[1]

    terminalInput[handler].onChange({ target: terminalInput })
    terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null })
  } else {
    ns.tprint(`No server was found matching ${search}`)
  }
}
