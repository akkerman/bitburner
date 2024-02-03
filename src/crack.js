/** @typedef {import('./NetscriptDefinitions').NS} NS */
import { scanner } from './scanner.js'
/** @param {NS} ns */
export async function main (ns) {
  scanner(ns, crack)

  function crack (host) {
    if (host === 'home') { return }
    if (ns.hasRootAccess(host)) return

    let open = 0
    if (ns.fileExists('BruteSSH.exe')) { ns.brutessh(host); open += 1 }
    if (ns.fileExists('FTPCrack.exe')) { ns.ftpcrack(host); open += 1 }
    if (ns.fileExists('relaySMTP.exe')) { ns.relaysmtp(host); open += 1 }
    if (ns.fileExists('HTTPWorm.exe')) { ns.httpworm(host); open += 1 }
    if (ns.fileExists('SQLInject.exe')) { ns.sqlinject(host); open += 1 }

    if (ns.getServerNumPortsRequired(host) <= open) {
      ns.nuke(host)
      ns.print(`Gained root access on ${host}`)
      ns.tprint(`Gained root access on ${host}`)
    }
  }
}
