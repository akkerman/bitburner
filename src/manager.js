/**
 * @typedef {import('./crawler.js').Data} Data
 * @typedef {import('./NetscriptDefinitions').NS} NS
 */

/** @param {NS} ns */
export async function main (ns) {
  const script = 'hgw.js'

  ns.exec('crawler.js', 'home')

  while (true) {
    /** @type {Data} */
    const servers = JSON.parse(ns.read('servers-json.txt'))
    const hackingLevel = ns.getHackingLevel()

    const workers = servers.workers.map(server => ({
      ...server, id: parseInt(server.host.split('-')[1], 10),
    })).sort((a, b) => a.id - b.id)

    const targets = servers.targets
      .filter(s => s.hasRootAccess && s.hackLevel <= hackingLevel)
      .sort((a, b) => {
        if (b.hackChance === a.hackChance) {
          return a.portsRequired - b.portsRequired
        }
        return b.hackChance - a.hackChance
      })

    let workerTargets = targets
    let homeTargets = targets

    // als er veel memory is op HOME dan kunnen we wachten met workers maken
    if (targets.length > workers.length && workers.length > 5) {
    // als het er weinig zijn dan altijd wel dingen execen op de workers!
    // hackchange worden er steeds meer 1 van ...
      workerTargets = targets.filter(s => s.portsRequired > 1)
      homeTargets = targets.filter(s => s.portsRequired <= 1)
    }

    execHome(homeTargets)
    execWorkers(workerTargets, workers)
    execRootedServers(targets)

    await ns.sleep(10000)
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

      const threads = 256
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

      execOneServer(script, 'home', threads, params)
    }
  }

  function execRootedServers (targets) {
    for (const rooted of targets) {
      const { host, maxMoney, moneyHacked, minSecurity, hackChance, memory } = rooted

      if (memory === 0) continue

      const hackThreads = Math.floor(0.5 / moneyHacked)
      const threads = Math.floor(memory / ns.getScriptRam(script))

      /** @type {Params} */
      const params = {
        target: host,
        securityThreshold: 5 + minSecurity,
        moneyThreshold: 0.75 * maxMoney,
        hackThreads: Math.min(hackThreads, threads),
        threads,
        hackChance,
      }

      execOneServer(script, host, threads, params)
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
        ns.kill(proc.pid)
      }
    }

    if (killOther) {
      for (const proc of ns.ps(host)) {
        if (proc.filename !== script) {
          ns.kill(proc.id)
          continue
        }

        const p = JSON.parse(proc.args[0])

        if (p.target !== params.target) {
          ns.kill(proc.pid)
        }
      }
    }

    if (ns.ps(host).find(sameScript)) return

    ns.print(`exec ${script} on ${host} with ${threads} threads and parameters: ${JSON.stringify(params)}`)
    ns.scp(script, host)
    ns.exec(script, host, threads, JSON.stringify(params))
  }
}
