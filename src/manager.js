/**
 * @typedef {import('./crawler.js').Data} Data
 * @typedef {import('./NetscriptDefinitions').NS} NS
 */

/** @param {NS} ns */
export function main (ns) {
  const script = 'hwg.js'

  /** @type {Data} */
  const servers = JSON.parse(ns.read('servers-json.txt'))
  const hackingLevel = ns.getHackingLevel()

  const workers = servers.workers.map(server => ({
    ...server, id: parseInt(server.host.split('-')[1], 10),
  })).sort((a, b) => a.id - b.id)

  const targets = servers.targets
    .filter(s => s.hasRootAccess && s.hackLevel < hackingLevel)
    .sort((a, b) => b.hackChance - a.hackChance)

  const workerTargets = targets.filter(s => s.hackChance < 1)
  const homeTargets = targets.filter(s => s.hackChance >= 1)

  const max = Math.min(workerTargets.length, workers.length)

  ns.print(`workers: ${workers.length}, targets: ${workerTargets.length}`)

  ns.print(`deploy to ${max} workers`)

  for (let i = 0; i < max; i += 1) {
    const { host: worker, memory } = workers[i]
    const { host: target, maxMoney, moneyHacked, minSecurity, hackChance } = workerTargets[i]

    const threads = Math.floor(memory / ns.getScriptRam(script))
    const hackThreads = Math.floor(0.5 / moneyHacked)

    /** @type {Params} */
    const params = {
      target,
      securityThreshold: 5 + minSecurity,
      moneyThreshold: 0.75 * maxMoney,
      hackThreads: Math.min(hackThreads, threads),
      threads,
      hackChance,
    }

    const scripts = ns.ps(worker)

    ns.print({ running: scripts })

    if (scripts.find(s => {
      if (s.filename !== script) return false
      const p = JSON.parse(s.args)

      return p.target === target && p.threads === threads
    })) continue

    ns.killall(worker)
    ns.scp(script, worker)
    ns.print(`Deploy ${script} on ${worker} with ${threads} threads and parameters: ${JSON.stringify(params)}`)
    ns.exec(script, worker, threads, JSON.stringify(params))
  }

  // function deployHomeScripts () {
  const runningScripts = ns.ps('home')
  const runningTargets = new Set()

  for (const running of runningScripts) {
    if (running.filename === script) {
      const params = JSON.parse(running.args[0])

      runningTargets.add(params.target)
    }
  }

  for (const ht of homeTargets) {
    const { host: target, maxMoney, moneyHacked, minSecurity, hackChance } = ht

    if (runningTargets.has(target)) continue

    const threads = 1024
    const hackThreads = Math.floor(0.5 / moneyHacked)

    /** @type {Params} */
    const params = {
      target,
      securityThreshold: 5 + minSecurity,
      moneyThreshold: 0.75 * maxMoney,
      hackThreads: Math.min(hackThreads, threads),
      threads,
      hackChance,
    }

    ns.print(`Deploy ${script} on home with ${threads} threads and parameters: ${JSON.stringify(params)}`)
    ns.exec(script, 'home', threads, JSON.stringify(params))
  }

  // function deployTargetScripts()
  for (const tgt of targets) {
    const { host: target, maxMoney, moneyHacked, minSecurity, hackChance, memory } = tgt

    if (memory === 0) continue
    if (ns.ps(target).find(s => s.filename === script)) continue

    ns.killall(target)

    const hackThreads = Math.floor(0.5 / moneyHacked)
    const threads = Math.floor(memory / ns.getScriptRam(script))

    /** @type {Params} */
    const params = {
      target,
      securityThreshold: 5 + minSecurity,
      moneyThreshold: 0.75 * maxMoney,
      hackThreads: Math.min(hackThreads, threads),
      threads,
      hackChance,
    }

    ns.print(`Deploy ${script} on target with ${threads} threads and parameters: ${JSON.stringify(params)}`)
    ns.scp(script, target)
    ns.exec(script, target, threads, JSON.stringify(params))
  }
}
