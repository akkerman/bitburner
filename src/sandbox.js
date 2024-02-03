/** @typedef {import('./NetscriptDefinitions').NS} NS */
/** @param {NS} ns */
export async function main (ns) { // eslint-disable-line 
  const data = JSON.parse(ns.read('servers-json.txt'))

  ns.disableLog('ALL')

  ns.clearLog()

  let totalRam = 0

  for (const { host } of data.targets) {
    const percent = ns.hackAnalyze(host)

    if (percent === 0) continue

    const max = ns.getServerMaxMoney(host) / 2

    const maxThreads = 0.5 / percent

    // const totalPercent = percent * maxThreads

    const scriptRam = ns.getScriptRam('prime.js')

    const maxRam = scriptRam * maxThreads

    const maxMon = ns.getServerMaxMoney(host)
    const hackAnalyze = ns.hackAnalyzeThreads(host, maxMon / 2)

    ns.print({ host, max, maxThreads, hackAnalyze, maxRam })
    totalRam += maxRam
  }

  ns.print(`total ram needed: ${totalRam}`)
  //
  //     let workerRam = 0
  //     for (const {memory} of data.workers) {
  //      workerRam += memory
  //     }
  //     ns.print(`total ram available: ${workerRam}`)

//  for (const { host } of data.misc) {
//    ns.print(host)
//  }
}
