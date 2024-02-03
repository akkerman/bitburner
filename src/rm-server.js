/** @typedef {import('./NetscriptDefinitions').NS} NS */
import { scanner } from './scanner.js'
/** @param {NS} ns */
export async function main (ns) { // eslint-disable-line 
  scanner(ns, server => {
    if (server.includes('worker')) {
      ns.tprint(`stop processes ${server}`)
      ns.killall(server)
      // ns.deleteServer(server)
    }
  })
}
