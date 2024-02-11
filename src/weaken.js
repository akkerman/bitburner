/** @param {NS} ns */
export async function main (ns) {
  await ns.weaken(ns.args[0])
  // ns.tprint(`weak ${ns.args[1]}`)
}
