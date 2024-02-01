import { scanner } from './scanner.js'
/** @param {NS} ns */
export async function main(ns) {
  scanner(ns, server => {
    if (server === 'worker' || server === 'worker-0') {
      ns.tprint(`stop processes ${server}`)
      ns.killall(server)
      ns.deleteServer(server)
    }
  })
}