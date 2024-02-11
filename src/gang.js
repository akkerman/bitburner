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

    if (G.getGangInformation().wantedLevel <= 2) {
      decreaseWanted = false
    }
    if (G.getGangInformation().wantedLevel > 25) {
      decreaseWanted = true
    }

    // assignment
    const task = decreaseWanted ? 'Vigilante Justice' : 'Territory Warfare'

    for (const memberName of G.getMemberNames()) {
      if (G.getMemberInformation(memberName).task !== task) {
        G.setMemberTask(memberName, task)
      }
    }

    for (const memberName of G.getMemberNames()) {
      const asc = G.getAscensionResult(memberName)

      if (asc) {
        ns.print(`${memberName} can ascend`)
        ns.print({ asc })
        if (asc.str > 1.5) {
          G.ascendMember(memberName)
          G.setMemberTask(memberName, task)
        }
        // ns.print(`current strength mult = ${G.getMemberInformation(memberName).str_asc_mult}`)
      } else {
        ns.print(`${memberName} can not ascend`)
      }
    }

    // // equipment
    // const equipment = G.getEquipmentNames()
    //   .map(equipName => ({
    //     equipName,
    //     cost: G.getEquipmentCost(equipName),
    //   }))
    //   .filter(({ equipName }) => {
    //     const stats = G.getEquipmentStats(equipName)

    //     return stats?.str || stats?.def || stats?.dex || stats?.agi
    //   })
    //   .sort((a, b) => a.cost - b.cost)

    // for (const eq of equipment) {
    //   for (const memberName of G.getMemberNames()) {
    //     G.purchaseEquipment(memberName, eq.equipName)
    //   }
    // }

    await ns.sleep(30000)
  }
}
