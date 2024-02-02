/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  const threads = ns.args[1]

  const securityThreshold = 5 + ns.getServerMinSecurityLevel(target)
  const moneyThreshold = 0.75 * ns.getServerMaxMoney(target)

  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThreshold) {
      await ns.weaken(target)
      continue
    }

    if (ns.getServerMoneyAvailable(target) < moneyThreshold) {
      await ns.grow(target)
      continue
    }

    await ns.hack(target)
  }
}