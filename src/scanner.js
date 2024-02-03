/** @typedef {import('./NetscriptDefinitions').NS} NS */
/**
 * @param {NS} ns
 * @param {(server:string)=>void} callback
 * @param {{
 *    rootAccess?: boolean
 *    hackLevel?: boolean
 * }} [options]
 */
export function scanner (ns, callback, { rootAccess, hackLevel } = {}) {
  const visited = new Set()
  const queue = ['home']
  let server

  while ((server = queue.shift())) {
    if (visited.has(server)) { continue }

    visited.add(server)
    queue.push(...ns.scan(server))

    if (rootAccess && !ns.hasRootAccess(server)) { continue }
    if (hackLevel && ns.getHackingLevel() < ns.getServerRequiredHackingLevel(server)) { continue }

    callback(server)
  }
}
