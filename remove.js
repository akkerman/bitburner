/** @param {NS} ns */
export async function main(ns) {
  let cmd = ''
  for (let i = 1; i < 30; i+=1) {
    cmd += `rm spam-${i}.txt.js; `
  }

  ns.tprint(cmd)
}