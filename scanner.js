/** 
 * @param {NS} ns
 * @param {(server:string)=>void} callback
 * @param {boolean} [rootAccess]
 */
export function scanner(ns, callback, rootAccess = false) {
  const visited = new Set()
  const queue = ['home']

  while (queue.length > 0) {
    const server = queue.shift()

    if (visited.has(server)) { continue }

    visited.add(server)
    queue.push(...ns.scan(server))

    if (rootAccess && !ns.hasRootAccess(server)) { continue }

    callback(server)
  }
}