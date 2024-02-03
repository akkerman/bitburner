/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @param {NS} ns */
export async function main (ns) {
  async function main () {
    const maxServers = ns.getPurchasedServerLimit()
    const maxRam = ns.getPurchasedServerMaxRam()

    let ram = ns.serverExists('worker-1') ? ns.getServerMaxRam('worker-1') * 2 : 8

    while (ram <= maxRam) {
      for (let serverId = 1; serverId <= maxServers; serverId += 1) {
        const host = 'worker-' + serverId
        const created = await ensureServer(host, ram)

        if (created) {
          ns.exec('crack.js', 'home')
          await ns.sleep(2000)
          ns.exec('crawler.js', 'home')
          await ns.sleep(2000)
          ns.exec('manager.js', 'home')
        }
      }
      ram *= 2
    }
  }

  await main()

  /**
   * Ensures a server with given name and ram exists.
   *
   * Buys the server if it does not exist.
   * Upgrades the server if it exists with less ram.
   * Leaves the server if it exist with more ram.
   *
   * @param {string} host
   * @param {number} ram
   * @returns {boolea} true if a new server was bought, false otherwise
   */
  async function ensureServer (host, ram) {
    if (ns.serverExists(host) && ram <= ns.getServerMaxRam(host)) {
      return false
    }

    while (ns.getServerMoneyAvailable('home') < ns.getPurchasedServerCost(ram)) {
      await ns.sleep(10000)
    }

    if (ns.serverExists(host)) {
      ns.killall(host)
      ns.deleteServer(host)
    }

    ns.purchaseServer(host, ram)
    return true
  }
}
