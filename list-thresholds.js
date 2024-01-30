/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  const minSecurityLevel = ns.getServerMinSecurityLevel(target)
  const currentSecurityLevel = ns.getServerSecurityLevel(target)

  const maxMoney = ns.getServerMaxMoney(target)
  const currentMoney = ns.getServerMoneyAvailable(target)

  ns.tprint({
    target,
    minSecurityLevel,
    currentSecurityLevel,
    maxMoney,
    currentMoney,
  })
}