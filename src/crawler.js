/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @typedef {Awaited<ReturnType<main>>} Data */
import { scanner } from './scanner.js'
/** @param {NS} ns */
export function main (ns) {
  /** @typedef {ReturnType<crawl>} Server */

  const data = {
    exported: 0,
    /** @type {Server[]} */
    workers: [],
    /** @type {Server[]} */
    targets: [],
    /** @type {Server[]} */
    misc: [],
  }

  scanner(ns, crawl)

  /** @param {string} host */
  function crawl (host) {
    const server = {
      host,
      hasRootAccess: ns.hasRootAccess(host),
      maxMoney: ns.getServerMaxMoney(host),
      moneyHacked: ns.hackAnalyze(host),
      hackChance: ns.hackAnalyzeChance(host),
      hackLevel: ns.getServerRequiredHackingLevel(host),
      hackTime: ns.getHackTime(host),
      memory: ns.getServerMaxRam(host),
      minSecurity: ns.getServerMinSecurityLevel(host),
    }

    if (host.includes('worker')) {
      data.workers.push(server)
    } else if (ns.getServerMoneyAvailable(host) > 0 &&
               server.hackChance > 0 &&
               host !== 'home') {
      data.targets.push(server)
    } else {
      data.misc.push(server)
    }

    return server
  }

  data.exported = new Date().getTime()
  ns.write('servers-json.txt', JSON.stringify(data), 'w')
  return data
}
