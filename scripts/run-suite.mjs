import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  decideStageGate,
  precheckFlagsForStage,
  processExitFromCounts,
  requiresForStage,
  suiteFunctionalStatus,
} from "./suite-gates.mjs";

/**
 * Orquestrador sequencial CERTIQA (Windows/PowerShell-friendly via node).
 *
 * Ordem: static → unit → smoke → login → cadastro → fases → final
 *
 * Flags:
 *   CERTIQA_ALLOW_AUTH=1
 *   CERTIQA_ALLOW_MUTATING=1
 *   CERTIQA_MASS_CONFIRMED=1   (confirmação humana do estado das contas)
 *
 * FAIL em static/unit/smoke → BLOCK das etapas AUTH/MUTATING.
 * HOLD/BLOCK nunca são registrados como PASS.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const allowAuth = process.env.CERTIQA_ALLOW_AUTH === "1";
const allowMutating = process.env.CERTIQA_ALLOW_MUTATING === "1";
const massConfirmed = process.env.CERTIQA_MASS_CONFIRMED === "1";

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCmd = process.execPath;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const evidenceDir = path.join(root, "evidence", `suite-${stamp}`);
fs.mkdirSync(evidenceDir, { recursive: true });

function runNode(script, args = []) {
  return spawnSync(nodeCmd, [script, ...args], {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });
}

function runNpm(scriptName) {
  // Scripts internos sem guard (evita deadlock com test:login etc.).
  const map = {
    "test:static": ["run", "test:static", "--silent"],
    "test:unit": ["run", "test:unit", "--silent"],
    "test:smoke": ["run", "test:smoke", "--silent"],
    "test:login:raw": [
      "exec",
      "--",
      "cypress",
      "run",
      "--spec",
      "cypress/e2e/features/login.feature",
    ],
    "test:cadastro:raw": [
      "exec",
      "--",
      "cypress",
      "run",
      "--spec",
      "cypress/e2e/features/cadastro.feature",
    ],
    "test:fases:raw": [
      "exec",
      "--",
      "cypress",
      "run",
      "--spec",
      "cypress/e2e/features/exames_fase.feature",
    ],
    "test:final:raw": [
      "exec",
      "--",
      "cypress",
      "run",
      "--spec",
      "cypress/e2e/features/exame_final.feature",
    ],
  };
  const args = map[scriptName] || ["run", scriptName, "--silent"];
  return spawnSync(npmCmd, args, {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
}

function checkEnv(flags) {
  return runNode("scripts/check-env.mjs", [...flags, "--json"]);
}

const stages = [
  { id: "static", kind: "STATIC", runKey: "test:static" },
  { id: "unit", kind: "STATIC", runKey: "test:unit" },
  { id: "smoke", kind: "READ_ONLY", runKey: "test:smoke" },
  { id: "login", kind: "AUTH", runKey: "test:login:raw" },
  { id: "cadastro", kind: "MUTATING", runKey: "test:cadastro:raw" },
  { id: "fases", kind: "AUTH+MUTATING", runKey: "test:fases:raw" },
  { id: "final", kind: "AUTH+MUTATING", runKey: "test:final:raw" },
];

const summary = {
  startedAt: new Date().toISOString(),
  evidenceDir: path.relative(root, evidenceDir).replace(/\\/g, "/"),
  authorization: {
    CERTIQA_ALLOW_AUTH: allowAuth,
    CERTIQA_ALLOW_MUTATING: allowMutating,
    CERTIQA_MASS_CONFIRMED: massConfirmed,
  },
  stages: [],
};

console.log("=== CERTIQA — suíte sequencial ===");
console.log(`Evidências: ${summary.evidenceDir}`);
console.log(
  `Autorização: AUTH=${allowAuth ? "SIM" : "NÃO"} MUTATING=${
    allowMutating ? "SIM" : "NÃO"
  } MASS=${massConfirmed ? "SIM" : "NÃO"}`
);

for (const stage of stages) {
  const entry = {
    id: stage.id,
    kind: stage.kind,
    status: "HOLD",
    exitCode: null,
    reason: null,
  };

  const preFlags = precheckFlagsForStage(stage.id);
  let precheckOk = true;
  let envReady = true;

  if (preFlags.length) {
    const pre = checkEnv(preFlags);
    const preLog = path.join(evidenceDir, `${stage.id}-precheck.json`);
    fs.writeFileSync(preLog, pre.stdout || pre.stderr || "{}");
    precheckOk = pre.status === 0;
    envReady = pre.status === 0;
  }

  const decision = decideStageGate({
    stageId: stage.id,
    requires: requiresForStage(stage.id),
    flags: { auth: allowAuth, mutating: allowMutating },
    completedStages: summary.stages,
    precheckOk,
    massConfirmed,
    envReady,
  });

  if (decision.action === "HOLD") {
    entry.status = "HOLD";
    entry.reason = decision.reason;
    console.log(`\n[${stage.id}] HOLD — ${entry.reason}`);
    summary.stages.push(entry);
    continue;
  }

  if (decision.action === "BLOCK") {
    entry.status = "BLOCK";
    entry.reason = decision.reason;
    entry.exitCode = 1;
    console.log(`\n[${stage.id}] BLOCK — ${entry.reason}`);
    summary.stages.push(entry);
    continue;
  }

  console.log(`\n[${stage.id}] EXECUTANDO (${stage.kind})...`);
  const result = runNpm(stage.runKey);
  const outPath = path.join(evidenceDir, `${stage.id}.log`);
  fs.writeFileSync(
    outPath,
    [
      `exit=${result.status}`,
      "",
      "--- stdout ---",
      result.stdout || "",
      "--- stderr ---",
      result.stderr || "",
    ].join("\n")
  );

  entry.exitCode = result.status ?? 1;
  if (entry.exitCode === 0) {
    entry.status = "PASS";
    console.log(`[${stage.id}] PASS`);
  } else {
    entry.status = "FAIL";
    entry.reason = `Exit code ${entry.exitCode}`;
    console.log(`[${stage.id}] FAIL (exit ${entry.exitCode})`);
  }

  summary.stages.push(entry);
}

summary.finishedAt = new Date().toISOString();
summary.counts = summary.stages.reduce(
  (acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  },
  { PASS: 0, FAIL: 0, SKIP: 0, HOLD: 0, BLOCK: 0 }
);

summary.suiteFunctionalStatus = suiteFunctionalStatus(summary.counts);
summary.processExit = processExitFromCounts(summary.counts);
summary.overallExit = summary.processExit;
summary.authorizationStatus =
  allowAuth || allowMutating
    ? massConfirmed
      ? "FLAGS_AND_MASS"
      : "FLAGS_ONLY"
    : "NONE";

const summaryPath = path.join(evidenceDir, "summary.json");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log("\n=== RESUMO ===");
for (const s of summary.stages) {
  console.log(
    `- ${s.id}: ${s.status}${
      s.exitCode !== null ? ` (exit ${s.exitCode})` : ""
    }${s.reason ? ` — ${s.reason}` : ""}`
  );
}
console.log(`Contagem: ${JSON.stringify(summary.counts)}`);
console.log(`processExit=${summary.processExit}`);
console.log(`suiteFunctionalStatus=${summary.suiteFunctionalStatus}`);
console.log(`authorizationStatus=${summary.authorizationStatus}`);
console.log(
  "Nota: processExit=0 com HOLD significa orquestração sem falha executada; não implica E2E completo PASS."
);
console.log(`Sumário salvo em ${path.relative(root, summaryPath)}`);

process.exit(summary.processExit);
