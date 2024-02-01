/** @param {NS} ns */
export async function main(ns) {

  async function main() {
    const script = 'prime.js'
    const scriptTarget = ns.args[0]

    const maxServers = ns.getPurchasedServerLimit()
    // const maxRam = ns.getPurchasedServerMaxRam()
    const maxRam = 8192

    let ram = ns.serverExists('worker-1') ? ns.getServerMaxRam('worker-1') : 8

    while (ram < maxRam) {
      for (let serverId = 1; serverId <= maxServers; serverId += 1) {
        const host = 'worker-' + serverId
        const created = await ensureServer(host, ram)
        if (created) {
          deploy(host, ram, script, scriptTarget)
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
  async function ensureServer(host, ram) {
    if (ns.serverExists(host) && ram <= ns.getServerMaxRam(host)) {
      return false
    }

    while (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(ram)) {
      await ns.sleep(10000)
    }

    if (ns.serverExists(host)) {
      ns.killall(host)
      ns.deleteServer(host)
    }

    ns.purchaseServer(host, ram)
    return true
  }

  /**
   * @param {string} host
   * @param {number} ram
   * @param {string} script
   * @param {string} scriptTarget
   */
  function deploy(host, ram, script, scriptTarget) {
    const threads = Math.floor(ram / ns.getScriptRam(script))

    ns.scp(script, host)
    ns.print(`starting ${threads} threads of ${script} at ${host} targeting ${scriptTarget}`)
    ns.exec(script, host, threads, scriptTarget)
  }
}