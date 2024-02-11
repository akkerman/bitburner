/** @typedef {import('./NetscriptDefinitions').NS} NS */
/**
 * @typedef {{
 *  target: string
 *  securityThreshold: number
 *  moneyThreshold: number
 *  hackThreads: number
 *  threads: number
 * }} Params
 */

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/** @param {NS} ns */
export async function main (ns) {
  /** @type {Params} */
  const host = 'harakiri-sushi'

  const wjs = 'weaken.js'
  const hjs = 'hack.js'
  const gjs = 'grow.js'

  const wt = ns.getWeakenTime(host)
  const ht = ns.getHackTime(host)
  const gt = ns.getGrowTime(host)

  const neededRam = [wjs, hjs, gjs].map(s => ns.getScriptRam(s)).reduce((a, b) => a + b)
  const availableRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home')

  const instances = Math.floor(availableRam / neededRam)

  // hack ends
  // tick + wt - 25
  // hack starts
  // tick + wt - 25 - ht

  // weaken1 ends
  // tick + wt
  // weaken1 starts
  // tick

  // grow end
  // tick + wt + 25
  // grow start
  // tick + wt + 25 - gt

  // weaken2 ends
  // tick + wt + 25 + 25
  // weaken2 starts
  // tick + wt + 25 + 25 - wt

  const weaken1 = 0
  const weaken2 = weaken1 + wt + 25 + 25 - wt
  const grow = weaken1 + wt + 25 - gt
  const hack = weaken1 + wt - 25 - ht

  const interval = Math.max(wt / instances, 500)

  let out = ''

  for (const [k, v] of Object.entries({
    neededRam,
    wt,
    ht,
    gt,
    weaken1,
    weaken2,
    grow,
    hack,
    interval,
    instances,
  })) {
    out += `${k}: ${v}\n`
  }

  ns.alert(out)

  setInterval(() => {
    setTimeout(() => ns.exec(wjs, 'home', 1, host), weaken1)
    setTimeout(() => ns.exec(wjs, 'home', 1, host), weaken2)
    setTimeout(() => ns.exec(gjs, 'home', 1, host), grow)
    setTimeout(() => ns.exec(hjs, 'home', 1, host), hack)
  }, interval)

  while (true) {
    await sleep(10)
  }
}
