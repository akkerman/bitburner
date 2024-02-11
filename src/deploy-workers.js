/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @param {NS} ns */
export async function main (ns) {
  async function main () {
    const maxServers = ns.getPurchasedServerLimit()
    const maxRam = ns.getPurchasedServerMaxRam()

    const numServers = ns.getPurchasedServers().length

    let ram = 8

    if (numServers > 0 && numServers < ns.getPurchasedServerLimit()) {
      ram = Math.min(ns.getServerMaxRam('worker-1'), 128)
    }
    if (numServers === ns.getPurchasedServers()) {
      ram = ns.getServerMaxRam('worker-1')
    }

    while (ram <= maxRam) {
      for (let serverId = 1; serverId <= maxServers; serverId += 1) {
        const host = 'worker-' + serverId

        await ensureServer(host, ram)
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

    const purSerCost = ns.getPurchasedServerCost(ram)

    while (ns.getServerMoneyAvailable('home') < purSerCost) {
      ns.print(`INFO Waiting for $${ns.formatNumber(purSerCost)} to upgrade ${host} to ${ns.formatRam(ram)}`)
      await ns.sleep(10000)
    }

    if (ns.serverExists(host)) {
      ns.upgradePurchasedServer(host, ram)
    } else {
      ns.purchaseServer(host, ram)
    }

    return true
  }
}
