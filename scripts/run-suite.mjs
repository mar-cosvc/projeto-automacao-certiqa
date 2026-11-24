import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Orquestrador sequencial CERTIQA (Windows/PowerShell-friendly via node).
 *
 * Ordem oficial:
 *   1. static
 *   2. unit
 *   3. smoke READ_ONLY
 *   4. login (AUTH)
 *   5. cadastro (MUTATING)
 *   6. fases (AUTH + MUTATING)
 *   7. final (AUTH + MUTATING + profiles)
 *
 * Flags de autorização (variáveis de ambiente):
 *   CERTIQA_ALLOW_AUTH=1       libera Login autenticado
 *   CERTIQA_ALLOW_MUTATING=1   libera Cadastro / Fases / Final
 *
 * Sem autorização, etapas sensíveis ficam HOLD (não mascaradas como PASS).
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const allowAuth = process.env.CERTIQA_ALLOW_AUTH === "1";
const allowMutating = process.env.CERTIQA_ALLOW_MUTATING === "1";

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
  return spawnSync(npmCmd, ["run", scriptName, "--silent"], {
    cwd: root,
    encoding: "utf8",
    shell: true,
  });
}

function checkEnv(flags) {
  return runNode("scripts/check-env.mjs", [...flags, "--json"]);
}

const stages = [
  {
    id: "static",
    kind: "STATIC",
    run: () => runNpm("test:static"),
  },
  {
    id: "unit",
    kind: "STATIC",
    run: () => runNpm("test:unit"),
  },
  {
    id: "smoke",
    kind: "READ_ONLY",
    run: () => runNpm("test:smoke"),
  },
  {
    id: "login",
    kind: "AUTH",
    requires: ["auth"],
    precheck: () => checkEnv(["--require-auth"]),
    run: () => runNpm("test:login"),
  },
  {
    id: "cadastro",
    kind: "MUTATING",
    requires: ["mutating"],
    run: () => runNpm("test:cadastro"),
  },
  {
    id: "fases",
    kind: "AUTH+MUTATING",
    requires: ["auth", "mutating"],
    precheck: () => checkEnv(["--require-auth"]),
    run: () => runNpm("test:fases"),
  },
  {
    id: "final",
    kind: "AUTH+MUTATING",
    requires: ["auth", "mutating"],
    precheck: () => checkEnv(["--require-auth", "--require-profiles"]),
    run: () => runNpm("test:final"),
  },
];

const summary = {
  startedAt: new Date().toISOString(),
  evidenceDir: path.relative(root, evidenceDir).replace(/\\/g, "/"),
  authorization: {
    CERTIQA_ALLOW_AUTH: allowAuth,
    CERTIQA_ALLOW_MUTATING: allowMutating,
  },
  stages: [],
};

function authorized(requires = []) {
  if (requires.includes("auth") && !allowAuth) return false;
  if (requires.includes("mutating") && !allowMutating) return false;
  return true;
}

console.log("=== CERTIQA — suíte sequencial ===");
console.log(`Evidências: ${summary.evidenceDir}`);
console.log(
  `Autorização: AUTH=${allowAuth ? "SIM" : "NÃO"} MUTATING=${allowMutating ? "SIM" : "NÃO"}`
);

let overallExit = 0;

for (const stage of stages) {
  const entry = {
    id: stage.id,
    kind: stage.kind,
    status: "HOLD",
    exitCode: null,
    reason: null,
  };

  if (stage.requires && !authorized(stage.requires)) {
    entry.status = "HOLD";
    entry.reason =
      "Sem autorização de execução (defina CERTIQA_ALLOW_AUTH=1 e/ou CERTIQA_ALLOW_MUTATING=1).";
    console.log(`\n[${stage.id}] HOLD — ${entry.reason}`);
    summary.stages.push(entry);
    continue;
  }

  if (stage.precheck) {
    const pre = stage.precheck();
    const preLog = path.join(evidenceDir, `${stage.id}-precheck.json`);
    fs.writeFileSync(preLog, pre.stdout || pre.stderr || "{}");
    if (pre.status !== 0) {
      entry.status = "HOLD";
      entry.exitCode = pre.status ?? 1;
      entry.reason = "Pré-condições de ambiente não atendidas (ver evidência precheck).";
      console.log(`\n[${stage.id}] HOLD — ${entry.reason}`);
      summary.stages.push(entry);
      // Não eleva overallExit: HOLD por config não é falha de produto.
      continue;
    }
  }

  console.log(`\n[${stage.id}] EXECUTANDO (${stage.kind})...`);
  const result = stage.run();
  const outPath = path.join(evidenceDir, `${stage.id}.log`);
  fs.writeFileSync(
    outPath,
    [`exit=${result.status}`, "", "--- stdout ---", result.stdout || "", "--- stderr ---", result.stderr || ""].join(
      "\n"
    )
  );

  entry.exitCode = result.status ?? 1;
  if (entry.exitCode === 0) {
    entry.status = "PASS";
    console.log(`[${stage.id}] PASS`);
  } else {
    entry.status = "FAIL";
    entry.reason = `Exit code ${entry.exitCode}`;
    overallExit = entry.exitCode || 1;
    console.log(`[${stage.id}] FAIL (exit ${entry.exitCode})`);
  }

  summary.stages.push(entry);
}

summary.finishedAt = new Date().toISOString();
summary.processExit = overallExit;
summary.overallExit = overallExit; // alias legado (= processExit)
summary.counts = summary.stages.reduce(
  (acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  },
  { PASS: 0, FAIL: 0, SKIP: 0, HOLD: 0 }
);

// Status funcional da suíte ≠ exit do processo.
// FAIL > HOLD > PASS. HOLD/SKIP nunca viram PASS.
if (summary.counts.FAIL > 0) {
  summary.suiteFunctionalStatus = "FAIL";
} else if (summary.counts.HOLD > 0 || summary.counts.SKIP > 0) {
  summary.suiteFunctionalStatus = "HOLD";
} else {
  summary.suiteFunctionalStatus = "PASS";
}

const summaryPath = path.join(evidenceDir, "summary.json");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log("\n=== RESUMO ===");
for (const s of summary.stages) {
  console.log(
    `- ${s.id}: ${s.status}${s.exitCode !== null ? ` (exit ${s.exitCode})` : ""}${
      s.reason ? ` — ${s.reason}` : ""
    }`
  );
}
console.log(`Contagem: ${JSON.stringify(summary.counts)}`);
console.log(`processExit=${overallExit}`);
console.log(`suiteFunctionalStatus=${summary.suiteFunctionalStatus}`);
console.log(
  "Nota: processExit=0 com HOLD significa orquestração concluída sem falha de etapa executada; não implica suíte E2E completa PASS."
);
console.log(`Sumário salvo em ${path.relative(root, summaryPath)}`);

process.exit(overallExit);
