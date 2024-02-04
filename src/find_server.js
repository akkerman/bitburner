/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @param {NS} ns */
export function main (ns) {
  const start = ns.getHostname()
  const search = ns.args[0]

  const rgx = new RegExp(search, 'ig')

  const visited = new Set()
  const queue = [{ server: start, path: [] }]

  let node

  while ((node = queue.shift())) {
    const { server, path } = node

    if (server.match(rgx)) {
      const p = path.concat([server]).join('; connect ')
      const idx = p.indexOf(';')

      ns.tprint(p.slice(idx + 1))
      return 'done'
    }
    if (visited.has(server)) { continue }
    visited.add(server)

    const newPath = path.concat([server])

    for (const neigbour of ns.scan(server)) {
      queue.push({ server: neigbour, path: newPath })
    }
  }
  ns.tprint(`No server was found matching ${search}`)
}
