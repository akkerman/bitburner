/**
 * @typedef {import('./NetscriptDefinitions').NS} NS
 * @typedef {import('./NetscriptDefinitions').GangMemberInfo} GangMemberInfo
 */

/** @param {NS} ns */
export async function main (ns) {
  const G = ns.gang
  let nr = G.getMemberNames().length + 1

  let decreaseWanted = false

  while (true) {
    if (ns.gang.canRecruitMember()) {
      const name = `g-${nr}`

      ns.gang.recruitMember(name)
      nr += 1
    }

    const wantedPenalty = G.getGangInformation().wantedPenalty

    ns.print(`wantedPenalty = ${wantedPenalty}`)
    if (wantedPenalty <= 5) {
      decreaseWanted = false
    }
    if (wantedPenalty > 30) {
      decreaseWanted = true
    }

    // assignment
    // const task = decreaseWanted ? 'Vigilante Justice' : 'Human Trafficking'
    const task = decreaseWanted ? 'Vigilante Justice' : 'Terrorism'
    // const task = 'Territory Warfare'

    for (const memberName of G.getMemberNames()) {
      if (G.getMemberInformation(memberName).task !== task) {
        G.setMemberTask(memberName, task)
      }
    }

    const ascendThreshold = 1.2

    for (const memberName of G.getMemberNames()) {
      const asc = G.getAscensionResult(memberName)

      if (asc) {
        ns.print(`${memberName} can ascend. Will ascend when ascension.str ${asc.str} equals ${ascendThreshold}`)
        // ns.print({ asc })
        if (asc.str > ascendThreshold) {
          G.ascendMember(memberName)
          G.setMemberTask(memberName, task)
        }
        // ns.print(`current strength mult = ${G.getMemberInformation(memberName).str_asc_mult}`)
      } else {
        ns.print(`${memberName} can not ascend`)
      }
    }

    // equipment
    //    const equipment = G.getEquipmentNames()
    //      .map(equipName => ({
    //        equipName,
    //        cost: G.getEquipmentCost(equipName),
    //      }))
    //      .filter(({ equipName }) => {
    //        const stats = G.getEquipmentStats(equipName)
    //
    //        return stats?.str || stats?.def || stats?.dex || stats?.agi
    //      })
    //      .sort((a, b) => a.cost - b.cost)
    //
    //    for (const eq of equipment) {
    //      for (const memberName of G.getMemberNames()) {
    //        G.purchaseEquipment(memberName, eq.equipName)
    //      }
    //    }

    await ns.sleep(30000)
  }
}
