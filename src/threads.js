/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @param {NS} ns */
export async function main (ns) { // eslint-disable-line

  const host = ns.args[0]

  ns.disableLog('ALL')

  ns.tprint(determineThreads(host))

  if (!ns.fileExists('Formulas.exe')) return

  ns.tprint('With Formulas.exe')
  ns.tprint(determineThreadsF(host))

  function determineThreads (host) {
    // part of the specified server’s money you will steal with a single thread hack
    const moneyHacked = ns.hackAnalyze(host)

    // assume we want half of all the money available
    const hackThreads = Math.floor(0.5 / moneyHacked)

    const increasedAfterHack = ns.hackAnalyzeSecurity(hackThreads, host)

    // amount of securityDecrease with one thread
    const securityDecrease = 0.05
    const weakenThreadsAfterHack = Math.ceil(increasedAfterHack / securityDecrease)

    // assuming we hacked half of the money,
    // how many threads do we need to double it again (back to about 100%)
    const growThreads = Math.ceil(ns.growthAnalyze(host, 2))
    const increasedAfterGrowth = ns.growthAnalyzeSecurity(growThreads)

    const weakenThreadsAfterGrowth = Math.ceil(increasedAfterGrowth / securityDecrease)

    return { hackThreads, weakenThreadsAfterHack, growThreads, weakenThreadsAfterGrowth }
  }

  function determineThreadsF (host) {
    const server = ns.getServer(host)
    const player = ns.getPlayer()
    // part of the specified server’s money you will steal with a single thread hack

    server.moneyAvailable = server.moneyMax
    const moneyHacked = ns.formulas.hacking.hackPercent(server, player)

    // assume we want half of all the money available
    const hackThreads = Math.floor(0.5 / moneyHacked)

    const increasedAfterHack = ns.hackAnalyzeSecurity(hackThreads, host)

    // amount of securityDecrease with one thread
    const securityDecrease = 0.05
    const weakenThreadsAfterHack = Math.ceil(increasedAfterHack / securityDecrease)

    // assuming we hacked half of the money,
    // how many threads do we need to double it again (back to about 100%)

    server.moneyAvailable = server.moneyMax / 2
    const growThreads = ns.formulas.hacking.growThreads(server, player, server.moneyMax)
    const increasedAfterGrowth = ns.growthAnalyzeSecurity(growThreads)

    const weakenThreadsAfterGrowth = Math.ceil(increasedAfterGrowth / securityDecrease)

    return { hackThreads, weakenThreadsAfterHack, growThreads, weakenThreadsAfterGrowth }
  }
}
