/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @typedef {Awaited<ReturnType<main>>} Data */
import { scanner } from './scanner.js'
/** @param {NS} ns */
export async function main (ns) {
  /** @typedef {ReturnType<crawl>} Server */

  const filename = 'servers-json.txt'

  /** @type {Data} */
  let oldData
  let data

  if (ns.fileExists(filename)) {
    oldData = JSON.parse(ns.read(filename))
  }

  while (true !== false) { // trick compiler in thinking the function returns something
    const newData = {
      exported: 0,
      /** @type {Server[]} */
      workers: [],
      /** @type {Server[]} */
      targets: [],
      /** @type {Server[]} */
      misc: [],
    }

    data = newData

    scanner(ns, crawl)

    if (diff(data, oldData)) {
      data.exported = Date.now()
      ns.write('servers-json.txt', JSON.stringify(data), 'w')
      ns.print('Changes written to file')
    } else {
      ns.print('No changes')
    }
    oldData = data
    await ns.sleep(30000)
  }

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
      portsRequired: ns.getServerNumPortsRequired(host),
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

  /**
   * @param {Data} data
   * @param {Data} oldData
   * @returns {boolean}
   */
  function diff (data, oldData) {
    if (!oldData) return true
    if (data.workers.length !== oldData.workers.length) return true
    if (data.targets.length !== oldData.targets.length) return true

    for (let i = 0; i < data.workers.length; i += 1) {
      if (data.workers[i].memory !== oldData.workers[i].memory) {
        return true
      }
    }

    if ((Date.now() - oldData.exported) > 15 * 60 * 1000) {
      // always refresh after 15 mins
      return true
    }

    return false
  }

  return data
}
