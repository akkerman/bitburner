# Bitburner Scripts

Een verzameling [Bitburner](https://bitburner.dev/)-Netscript-scripts voor het automatiseren van het hack-grow-weaken cyclus, gang-management, server-infiltraties en andere game-tasks.

## Projectstructuur

```
.
├── src/              # Netscript-scripts (ES-modules, geladen tijdens het spel)
├── data/             # Referentie-data (augmentations, factions)
├── servers-json.txt  # Uitvoer van crawler.js — kaart van alle servers
├── filesync.json     # Configuratie voor bitburner-filesync
└── package.json
```

## Scripts (`src/`)

### Kern-cyclus (hack/grow/weaken)

| Script | Functie |
|---|---|
| `hack.js` | Eén `hack()`-actie op een target. |
| `grow.js` | Eén `grow()`-actie op een target. |
| `weaken.js` | Eén `weaken()`-actie op een target. |
| `hgw.js` | Volledige hack/grow/weaken loop met instelbare thresholds (security, money, threads). |
| `wg.js` | Grow/weaken-only variant (voor servers die niet gehackt kunnen worden of waar alleen rep/geld gemaximaliseerd moet worden). |
| `prime.js` | Prepareert een server: verlaagt security tot onder de threshold en groeit tot 75% van het max. geld, klaar voor `hgw.js`. |
| `batch.js` | Voert meerdere `hgw.js`-runs in batch (bijv. per level-bump) uit. |
| `threads.js` | Berekent het optimale aantal threads voor een target `hack()` (met en zonder `Formulas.exe`). |
| `sandbox.js` | Test-sandbox: analyseert hack-kansten en RAM-gebruik over alle servers uit `servers-json.txt`. |
| `list-thresholds.js` | Toont security-/geld-thresholds voor een target om handmatig te tunen. |

### Orkestratie

| Script | Functie |
|---|---|
| `manager.js` | Hoofd-manager: leest `servers-json.txt`, deelt RAM uit over servers en draait `hgw.js` per worker-server. |
| `deploy-workers.js` | Koopt/maakt worker-servers aan en kopieert scripts heen. |
| `bot.js` | Genereert automatisch server-structuur (via `scanner.js`) en deployt de benodigde scripts. |
| `rm-server.js` | Stopt alle processen op worker-servers. |

### Netwerk / reconnaissance

| Script | Functie |
|---|---|
| `scanner.js` | Gedeelde DFS-scanner over het netwerk (gebruikt door meerdere scripts). |
| `crawler.js` | Creept het hele netwerk, slaat server-data op in `servers-json.txt` en cracked servers automatisch (BruteSSH/FTPCrack/relaySMTP/AutoBrewer). |
| `crack.js` | Opent servers met alle beschikbare `.exe`-exploits. |
| `contracts.js` | Scant alle servers naar contracts. |
| `find_server.js` | Zoekt een server op naam (regex) via de console. |
| `map.js` | Tekent een visuele netwerkaart in de console (gebaseerd op een script van de community). |

### Gang / karakter

| Script | Functie |
|---|---|
| `gang.js` | Recruit en train gang-leden (combat/vigilante/etc.). |
| `alt-gang.js` | Extensie op gang-management (gebaseerd op een Steam-workshop script). |
| `infiltrate.js` | Automatisering van company-infiltraties (community-script met eigen extensions: `--auto`, `--faction`). |
| `karma.js` | Herstelt negatieve karma (heartbreak). |

### Diversen

| Script | Functie |
|---|---|
| `share.js` | Draait `share()` in een oneindige loop (datacenter op home). |
| `NetscriptDefinitions.d.ts` | TypeScript type definities voor de `NS` API. |

## Data

- `data/augmentations.jsonl` — lijst van augmentations met eigenschappen.
- `data/factions.jsonl` — lijst van factions met vereisten en bonuses.
- `data/augmentation-dot.js` — helper voor augmentation-visualisatie.

## Development

Afhankelijkheden:

- [bitburner-filesync](https://github.com/418sec/bitburner-filesync) — synchroniseert dit repo met de Bitburner-game (geconfigureerd in `filesync.json`).
- ESLint (standard) voor linting.

```bash
npm install
npm run lint   # lint alle scripts
npm run sync   # filesync: sync src/ met de game
```

Type-check/typografie: de scripts zijn ES-modules met JSDoc-typing; `tsconfig.json` staat klaar voor editor-integratie (`npm i -D typescript` indien nodig).

## Werkflow

1. `crawler.js` op `home` draaien → `servers-json.txt` bijwerken.
2. `deploy-workers.js` draaien om worker-servers aan temaken.
3. `manager.js` draaien → deelt RAM uit en start `hgw.js` per target.
4. Gang/infiltraties draaien via `gang.js`, `infiltrate.js`.
