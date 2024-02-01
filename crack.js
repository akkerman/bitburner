import { scanner } from './scanner.js'
/** @param {NS} ns */
export async function main(ns) {
  scanner(ns, crack)

  function crack(server) {
    if (server === 'home') { return }
    let open = 0
    if (ns.fileExists('BruteSSH.exe')) { ns.brutessh(server); open += 1 }
    if (ns.fileExists('FTPCrack.exe')) { ns.ftpcrack(server); open += 1 }
    if (ns.fileExists('relaySMTP.exe')) { ns.relaysmtp(server); open += 1 }
    if (ns.fileExists('HTTPWorm.exe')) { ns.httpworm(server); open += 1 }

    if (ns.getServerNumPortsRequired(server) <= open) {
      ns.tprint(`nuke ${server}`)
      ns.nuke(server)
    }
  }
}