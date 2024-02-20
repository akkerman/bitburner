/**
 * @typedef {import('./crawler.js').Data} Data
 * @typedef {import('./NetscriptDefinitions').NS} NS
 */

/** @param {NS} ns */
export async function main (ns) {
  const script = 'hgw.js'
  let dataExported
  let nextLevel = 0

  while (true) {
    /** @type {Data} */
    const servers = JSON.parse(ns.read('servers-json.txt'))

    const hackingLevel = ns.getHackingLevel()
    const homeRam = ns.getServerMaxRam('home')
    const dataChanged = !dataExported || dataExported !== servers.exported
    const nextLevelReached = nextLevel > 0 && nextLevel < hackingLevel

    if (!(dataChanged || nextLevelReached)) {
      await ns.sleep(10000)
      continue
    }

    dataExported = servers.exported

    const workers = servers.workers.map(server => ({
      ...server, id: parseInt(server.host.split('-')[1], 10),
    })).sort((a, b) => a.id - b.id)

    const targets = servers.targets
      .filter(s => s.hasRootAccess && s.hackLevel <= hackingLevel)
      .sort((a, b) => {
        const diff = a.hackLevel - b.hackLevel

        if (diff) return diff
        return a.host < b.host ? -1 : 1
      })

    let homeTargets = targets
    let workerTargets = targets

    if (workers.length === 25 && targets.length > 25) {
      homeTargets = targets.slice(0, targets.length - 25)
      workerTargets = targets.slice(targets.length - 25)
    }

    const scriptsRam = ns.getScriptRam('manager.js') + ns.getScriptRam('crawler.js') + ns.getScriptRam('deploy-workers.js')
    const homeAvailableHgw = Math.max(0, homeRam - scriptsRam)

    if (hackingLevel <= 100) {
      const { host, minSecurity, maxMoney , moneyHacked } = homeTargets.find(s => s.host === 'n00dles')
      /** @type {Params} */
      const params = {
        target: host,
        securityThreshold: 5 + minSecurity,
        moneyThreshold: maxMoney,
      }

      if (homeRam <= 256) {
        const threads = Math.floor(homeAvailableHgw / ns.getScriptRam(script))
        const hackThreads = Math.floor(0.5 / moneyHacked)

        params.hackThreads = Math.min(hackThreads, threads)
        params.threads = threads
        execOneServer(script, 'home', threads, params, false)
      }

      for (const server of homeTargets) {
        const threads = Math.floor(server.memory / ns.getScriptRam(script))

        params.hackThreads = threads
        params.threads = threads

        execOneServer(script, server.host, threads, params, true)
      }
    } else {
      execHome(homeTargets)
      execWorkers(workerTargets, workers)
      weakenGrowRootedServers(targets)
    }
    const nextTarget = servers.targets
      .sort((a, b) => b.hackLevel - a.hackLevel)
      .find(s => s.hasRootAccess && s.hackLevel > hackingLevel)

    nextLevel = nextTarget ? nextTarget.hackLevel : 0
  }

  // end of main

  function execWorkers (workerTargets, workers) {
    const max = Math.min(workerTargets.length, workers.length)

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

      execOneServer(script, worker, threads, params, true)
    }
  }

  function execHome (homeTargets) {
    for (const ht of homeTargets) {
      const { host: target, maxMoney, moneyHacked, minSecurity, hackChance } = ht

      // minimum could be 8, at start of bitnode this will run one hgw
      const threads = 8
      const hackThreads = Math.floor(0.5 / moneyHacked)
      const factor = maxMoney < 5_000_000 ? 1 : 0.75

      /** @type {Params} */
      const params = {
        target,
        securityThreshold: 5 + minSecurity,
        moneyThreshold: factor * maxMoney,
        hackThreads: Math.min(hackThreads, threads),
        threads,
        hackChance,
      }

      execOneServer(script, 'home', threads, params)
    }
  }

  function weakenGrowRootedServers (targets) {
    const weakenGrow = 'wg.js'

    for (const rooted of targets) {
      const { host, maxMoney, moneyHacked, minSecurity, hackChance, memory } = rooted

      if (memory === 0) continue

      const hackThreads = Math.floor(0.5 / moneyHacked)
      const threads = Math.floor(memory / ns.getScriptRam(weakenGrow))

      /** @type {Params} */
      const params = {
        target: host,
        securityThreshold: 5 + minSecurity,
        moneyThreshold: maxMoney,
        hackThreads: Math.min(hackThreads, threads),
        threads,
        hackChance,
      }

      execOneServer(weakenGrow, host, threads, params, true)
    }
  }

  function makeSameScript (script, target) {
    return (proc) => {
      if (proc.filename !== script) return false

      const p = JSON.parse(proc.args[0])

      return p.target === target
    }
  }

  function execOneServer (script, host, threads, params, killOther = false) {
    const sameScript = makeSameScript(script, params.target)
    const processes = ns.ps(host).filter(sameScript)

    for (const proc of processes) {
      if (proc.threads !== threads) {
        ns.print(`WARN killing script on ${host} because different threads wanted ${threads} != actual ${proc.threads}`)
        ns.kill(proc.pid)
      }
    }

    if (killOther) {
      for (const proc of ns.ps(host)) {
        if (proc.filename !== script) {
          ns.print(`WARN killing script on ${host} because different name wanted ${script} != actual ${proc.filename}`)
          ns.kill(proc.pid)
          continue
        }

        const p = JSON.parse(proc.args[0])

        if (p.target !== params.target) {
          ns.print(`WARN killing script on ${host} because different target, wanted ${params.target} != actual ${p.target}`)
          ns.kill(proc.pid)
        }
      }
    }

    if (ns.ps(host).find(sameScript)) return

    ns.scp(script, host)
    ns.exec(script, host, threads, JSON.stringify(params))
  }
}
