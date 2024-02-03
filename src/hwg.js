/**
 * @typedef {{
 *  target: string
 *  securityThreshold: number
 *  moneyThreshold: number
 *  hackThreads: number
 *  threads: number
 * }} Params
 */


/** @param {NS} ns */
export async function main(ns) {

  /** @type {Params} */
  const p = JSON.parse(ns.args[0])
  const target = p.target

  while (true) {
    if (ns.getServerSecurityLevel(target) > p.securityThreshold) {
      await ns.weaken(target)
      continue
    }

    if (ns.getServerMoneyAvailable(target) < p.moneyThreshold) {
      await ns.grow(target)
      continue
    }

    await ns.hack(target, {threads: p.hackThreads})
  }
}