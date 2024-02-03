/** @param {NS} ns */
export async function main(ns) {
  const contracts = new Map()
  const visited = new Set()
  const queue = ['home']

  while (queue.length > 0) {
    const server = queue.shift()
    if (visited.has(server)) { continue }
    visited.add(server)
    find(server)
    queue.push(...ns.scan(server))
  }

  ns.tprint(`Found ${contracts.size} contracts.`)
  for (const [server, cct] of contracts.entries()) {
    ns.print (` - ${server}, ${cct}`)
  }

  function find(server) {
    const files = ns.ls(server)
    const cct = files.filter(f => f.includes('cct'))

    if (cct.length > 0) {
      contracts.set(server, cct)
    }
  }
}