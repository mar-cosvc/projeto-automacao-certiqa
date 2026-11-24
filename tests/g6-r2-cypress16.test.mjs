/**
 * G6-R2 — regressão Cypress 16 / Mass Factory / emailDomain / senha temporária.
 * Não usa credenciais reais nem cria contas.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  criarEstadoCenarioCadastro,
  gerarEmailUnico,
  gerarMassaCadastroPositiva,
  gerarSenhaValida,
  obterDominioEmail,
} from "../cypress/support/data/massas.mjs";
import { precheckFlagsForStage } from "../scripts/suite-gates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_ENV = path.join(ROOT, "scripts", "check-env.mjs");
const DOMINIO_OK = "mass.factory.g6r2.test";

const FAKE_OK = {
  email: "gate.login.valid@certiqa.fake",
  password: "GateFake-Login-99",
};
const FAKE_EMAIL_JA = {
  email: "gate.dup.account@certiqa.fake",
};

const tempDirs = [];

function makeEnvDir(payload) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "certiqa-g6r2-"));
  tempDirs.push(dir);
  fs.writeFileSync(
    path.join(dir, "cypress.env.json"),
    JSON.stringify(payload, null, 2),
    "utf8"
  );
  return dir;
}

function runCheckEnv(cwd, flags = []) {
  return spawnSync(process.execPath, [CHECK_ENV, ...flags, "--json"], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

function parseResult(proc) {
  let json = null;
  try {
    json = JSON.parse(proc.stdout || "");
  } catch {
    json = null;
  }
  return { code: proc.status, json, stdout: proc.stdout || "", stderr: proc.stderr || "" };
}

afterEach(() => {
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
});

describe("G6-R2 A — Cypress 16 sem Cypress.env: domínio explícito", () => {
  it("gera massa com domínio explícito", () => {
    const m = gerarMassaCadastroPositiva({ dominio: DOMINIO_OK });
    assert.match(m.email, new RegExp(`@${DOMINIO_OK}$`));
    assert.ok(m.senha.length >= 6);
    assert.ok(m.nome.trim());
  });
});

describe("G6-R2 B — emailDomain via objeto estilo cy.env", () => {
  it("gera cadastro a partir do domínio informado no env simulado", () => {
    // Simula o payload de cy.env(["emailDomain"]).then((env) => …)
    const env = { emailDomain: DOMINIO_OK };
    const dominio = String(env.emailDomain || "")
      .trim()
      .replace(/^@/, "");
    assert.ok(dominio);
    const m = gerarMassaCadastroPositiva({ dominio });
    assert.match(m.email, new RegExp(`@${DOMINIO_OK}$`));
  });
});

describe("G6-R2 C — emailDomain ausente: bloqueio controlado", () => {
  it("Mass Factory pura rejeita ausência de domínio", () => {
    delete process.env.CERTIQA_EMAIL_DOMAIN;
    assert.throws(() => obterDominioEmail({}), /emailDomain|Domínio/);
    assert.throws(() => gerarEmailUnico({}), /emailDomain|Domínio/);
  });

  it("check-env --require-email-domain bloqueia Cadastro sem domínio", () => {
    const dir = makeEnvDir({ ...FAKE_OK, emailJaCadastrado: FAKE_EMAIL_JA });
    const r = parseResult(
      runCheckEnv(dir, [
        "--require-email-ja-cadastrado",
        "--require-email-domain",
        "--reject-placeholders",
      ])
    );
    assert.equal(r.code, 1);
    assert.ok(r.json.blocks.some((b) => /emailDomain/.test(b)));
  });
});

describe("G6-R2 D — emailDomain placeholder: bloqueio Cadastro", () => {
  it("rejeita exemplo.test", () => {
    const dir = makeEnvDir({
      ...FAKE_OK,
      emailDomain: "exemplo.test",
      emailJaCadastrado: FAKE_EMAIL_JA,
    });
    const r = parseResult(
      runCheckEnv(dir, ["--require-email-domain", "--reject-placeholders"])
    );
    assert.equal(r.code, 1);
    assert.ok(r.json.blocks.some((b) => /emailDomain/.test(b)));
  });

  it("rejeita placeholder documentado do example", () => {
    const dir = makeEnvDir({
      ...FAKE_OK,
      emailDomain: "dominio-autorizado.do.time",
      emailJaCadastrado: FAKE_EMAIL_JA,
    });
    const r = parseResult(runCheckEnv(dir, ["--require-email-domain"]));
    assert.equal(r.code, 1);
    assert.ok(r.json.blocks.some((b) => /emailDomain|placeholder/i.test(b)));
  });
});

describe("G6-R2 E — Login independente de emailDomain", () => {
  it("pré-check Login não exige emailDomain", () => {
    assert.equal(
      precheckFlagsForStage("login").includes("--require-email-domain"),
      false
    );
    const dir = makeEnvDir({ ...FAKE_OK });
    const r = parseResult(
      runCheckEnv(dir, ["--require-auth", "--reject-placeholders"])
    );
    assert.equal(r.code, 0);
    assert.equal(r.json.hasEmailDomain, false);
    assert.equal(r.json.blocks.length, 0);
  });
});

describe("G6-R2 F — senha de duplicidade: senha e confirmação iguais", () => {
  it("guardar e obter retornam a mesma senha fictícia válida", () => {
    const estado = criarEstadoCenarioCadastro();
    const senha = estado.guardarSenhaDuplicidade(gerarSenhaValida());
    assert.ok(senha.length >= 6);
    assert.equal(estado.obterSenhaDuplicidade(), senha);
  });
});

describe("G6-R2 G — isolamento entre cenários", () => {
  it("limpar impede vazamento da senha temporária", () => {
    const estado = criarEstadoCenarioCadastro();
    estado.guardarSenhaDuplicidade(gerarSenhaValida());
    estado.limpar();
    assert.throws(() => estado.obterSenhaDuplicidade(), /ausente|temporária/i);

    const senha2 = estado.guardarSenhaDuplicidade(gerarSenhaValida());
    assert.equal(estado.obterSenhaDuplicidade(), senha2);
  });
});

describe("G6-R2 H — e-mail único", () => {
  it("duas massas geram e-mails diferentes", () => {
    const a = gerarMassaCadastroPositiva({ dominio: DOMINIO_OK });
    const b = gerarMassaCadastroPositiva({ dominio: DOMINIO_OK });
    assert.notEqual(a.email, b.email);
  });
});

describe("G6-R2 I — G5-R3 placeholders por perfil permanecem corretos", () => {
  it("Final não exige emailDomain; Login escopo de placeholder intacto", () => {
    assert.equal(
      precheckFlagsForStage("final").includes("--require-email-domain"),
      false
    );
    const dir = makeEnvDir({
      ...FAKE_OK,
      alunoCompleto: {
        email: "aluno.completo@exemplo.test",
        password: "SuaSenhaSegura@123",
      },
      emailDomain: "exemplo.test",
    });
    // Login: placeholder de perfil opcional = aviso; flat OK = PASS
    const login = parseResult(
      runCheckEnv(dir, ["--require-auth", "--reject-placeholders"])
    );
    assert.equal(login.code, 0);
    assert.ok(login.json.warnings.length >= 1);
  });
});

describe("G6-R2 J — nenhuma chamada executável Cypress.env()", () => {
  it("cypress/**/*.js e *.mjs sem Cypress.env(", () => {
    const roots = [path.join(ROOT, "cypress")];
    const offenders = [];

    function walk(dir) {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.(js|mjs)$/.test(ent.name)) continue;
        const src = fs.readFileSync(full, "utf8");
        // Ignora comentários de linha que apenas mencionam a API removida.
        const lines = src.split(/\r?\n/);
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;
          if (/Cypress\.env\s*\(/.test(line)) {
            offenders.push(`${path.relative(ROOT, full)}:${idx + 1}`);
          }
        });
      }
    }

    for (const r of roots) walk(r);
    assert.deepEqual(
      offenders,
      [],
      `Cypress.env() residual: ${offenders.join(", ")}`
    );
  });
});
