/** @param {NS} ns */
export async function main(ns) {
  const script = 'hwg.js'

  /** @type {Data} */
  const servers = JSON.parse(ns.read('servers-json.txt'))
  const hackingLevel = ns.getHackingLevel()

  const targets = servers.targets
    .filter(s => s.hasRootAccess && s.hackLevel < hackingLevel)
    .sort((a, b) => b.hackChance - a.hackChance)


  const max = Math.min(targets.length, servers.workers.length)

  ns.print(`workers: ${servers.workers.length}, targets: ${targets.length}`)

  ns.print(`deploy to ${max} workers`)

  for (let i = 0; i < max; i += 1) {
    const { host: worker, memory } = servers.workers[i]
    const { host: target, maxMoney, moneyHacked, minSecurity } = targets[i]

    const threads = Math.floor(memory / ns.getScriptRam(script))

    ns.killall(worker)
    ns.scp(script, worker)

    const hackThreads = Math.floor(0.5 / moneyHacked)

    /** @type {Params} */
    const params = {
      target,
      securityThreshold: 5 + minSecurity,
      moneyThreshold: 0.75 * maxMoney,
      hackThreads: Math.min(hackThreads, threads),
      threads,
    }

    ns.print(`Deploy ${script} on ${worker} with ${threads} threads and parameters: ${JSON.stringify(params)}`)
    ns.exec(script, worker, threads, JSON.stringify(params))
  }
}

/**
 * @typedef {{
 *   host: string               
 *   hasRootAccess: boolean
 *   maxMoney: number
 *   moneyHacked: number
 *   hackChance: number
 *   hackLevel: number
 *   hackTime: number
 *   memory: number
 *   minSecurity: number
 * }} Server
 * 
 * @typedef {{
 *   exported: number
 *   workers: Server[]
 *   targets: Server[]
 *   misc: Server[]
 * }} Data
 * 
 * @typedef {{
 *  target: string
 *  securityThreshold: number
 *  moneyThreshold: number
 *  hackThreads: number
 *  threads: number
 * }} Params
 */