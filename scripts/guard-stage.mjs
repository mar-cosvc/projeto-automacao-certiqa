/**
 * Guarda para comandos npm individuais (test:login, test:cadastro, …).
 * Impede contornar as proteções do orquestrador.
 *
 * Uso:
 *   node scripts/guard-stage.mjs <login|cadastro|fases|final>
 *
 * Exit 0 = liberado; exit 2 = HOLD/bloqueio (não executa Cypress).
 */

import { spawnSync } from "node:child_process";
import {
  decideStageGate,
  precheckFlagsForStage,
  requiresForStage,
} from "./suite-gates.mjs";

const stageId = process.argv[2];
const allowed = new Set(["login", "cadastro", "fases", "final"]);

if (!allowed.has(stageId)) {
  console.error(
    `Uso: node scripts/guard-stage.mjs <${[...allowed].join("|")}>`
  );
  process.exit(1);
}

const flags = {
  auth: process.env.CERTIQA_ALLOW_AUTH === "1",
  mutating: process.env.CERTIQA_ALLOW_MUTATING === "1",
};
const massConfirmed = process.env.CERTIQA_MASS_CONFIRMED === "1";

const preFlags = precheckFlagsForStage(stageId);
let precheckOk = true;
let envReady = true;

if (preFlags.length) {
  const pre = spawnSync(
    process.execPath,
    ["scripts/check-env.mjs", ...preFlags, "--json"],
    { encoding: "utf8", shell: false }
  );
  precheckOk = pre.status === 0;
  envReady = pre.status === 0;
  if (pre.stdout) {
    // Imprime JSON estrutural (sem senhas — check-env não emite valores).
    console.log(pre.stdout.trim());
  }
}

const decision = decideStageGate({
  stageId,
  requires: requiresForStage(stageId),
  flags,
  completedStages: [], // comando individual: sem contexto de infra da suíte
  precheckOk,
  massConfirmed,
  envReady,
});

if (decision.action !== "RUN") {
  console.error(
    `[guard:${stageId}] ${decision.action} — ${decision.reason}`
  );
  console.error(
    "Use npm run test:all após pré-requisitos, ou defina as flags/massa adequadas."
  );
  process.exit(2);
}

console.log(`[guard:${stageId}] liberado`);
process.exit(0);
