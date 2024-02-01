import { scanner } from './scanner.js'
/** @param {NS} ns */
export async function main(ns) {
  const data = {
    workers: [],
    targets: [],
    misc: [],
  }
 
  scanner(ns, crawl)

  function crawl(host) {
   const server =  {
      host,
      hasRootAccess: ns.hasRootAccess(host),
      maxMoney: ns.getServerMaxMoney(host),
      hackChance: ns.hackAnalyzeChance(host),
    }

    if (host.includes('worker')) {
      data.workers.push(server)
      return
    }
    if (ns.getServerMoneyAvailable(host) > 0) {
      data.targets.push(server)
      return
    }
    data.misc.push(server)
  }

  ns.write('servers-json.txt', JSON.stringify(data), 'w')
}

 
 
 
 
 
 
 