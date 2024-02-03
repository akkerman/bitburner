import { scanner } from './scanner.js'
/** @param {NS} ns */
export async function main(ns) {
  const script = ns.args[0]
  const target = ns.args[1]
  const maxThreads = ns.args.length === 3 ? ns.args[2] : Number.MAX_SAFE_INTEGER

  if (target !== 'local' && !ns.hasRootAccess(target)) {
    ns.print(`no root access on target ${target}`)
    ns.tprint(`no root access on target ${target}`)
    return
  }

  scanner(ns, deploy, {rootAccess: true, hackLevel: true})

  function deploy(server) {
    if (server === 'home') { return }


    if (target === 'local' && ns.getServerMoneyAvailable(server) === 0) {
      ns.tprint(`no money on server ${server}`)
      return
    }

    ns.scp(script, server)

    const max = ns.getServerMaxRam(server)
    const used = ns.getServerUsedRam(server)
    const s = ns.getScriptRam(script)
    const threads = Math.min(maxThreads, Math.floor((max - used) / s))

    if (threads === 0) {
      ns.tprint(`server ${server} is at capacity`)
      return
    }

    const scriptTarget = target === 'local' ? server : target
    ns.tprint(`starting ${threads} threads of ${script} at ${server} targeting ${scriptTarget}`)
    ns.exec(script, server, threads, scriptTarget, threads)
  }
}