import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "scripts", "check-env.mjs");

/** Credenciais fictícias que NÃO batem nos detectores de placeholder. */
const FAKE_OK = {
  email: "gate.login.valid@certiqa.fake",
  password: "GateFake-Login-99",
};
const FAKE_EMAIL_JA = {
  email: "gate.dup.account@certiqa.fake",
  password: "GateFake-EmailJa-99",
};
const FAKE_COMPLETO = {
  email: "gate.profile.full@certiqa.fake",
  password: "GateFake-Completo-99",
};
const FAKE_PENDENTE = {
  email: "gate.profile.pending@certiqa.fake",
  password: "GateFake-Pendente-99",
};
const FAKE_REPROVADO = {
  email: "gate.profile.failed@certiqa.fake",
  password: "GateFake-Reprovado-99",
};

/** Placeholders alinhados ao cypress.env.example.json (somente fictícios). */
const PH_FLAT = {
  email: "seu.usuario@exemplo.test",
  password: "SuaSenhaSegura@123",
};
const PH_COMPLETO = {
  email: "aluno.completo@exemplo.test",
  password: "SuaSenhaSegura@123",
};
const PH_PENDENTE = {
  email: "aluno.fase.pendente@exemplo.test",
  password: "SuaSenhaSegura@123",
};
const PH_REPROVADO = {
  email: "aluno.reprovado@exemplo.test",
  password: "SuaSenhaSegura@123",
};
const PH_EMAIL_JA = {
  email: "usuario.ja.cadastrado@exemplo.test",
  password: "SuaSenhaSegura@123",
};

const tempDirs = [];

function makeEnvDir(payload, { invalidJson = false } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "certiqa-check-env-"));
  tempDirs.push(dir);
  const envPath = path.join(dir, "cypress.env.json");
  if (invalidJson) {
    fs.writeFileSync(envPath, "{ not-valid-json ", "utf8");
  } else {
    fs.writeFileSync(envPath, JSON.stringify(payload, null, 2), "utf8");
  }
  return dir;
}

function runCheckEnv(cwd, flags = []) {
  return spawnSync(process.execPath, [SCRIPT, ...flags, "--json"], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

function parseResult(proc) {
  const stdout = proc.stdout || "";
  const stderr = proc.stderr || "";
  let json = null;
  try {
    json = JSON.parse(stdout);
  } catch {
    json = null;
  }
  return { code: proc.status, stdout, stderr, json };
}

function assertNoSecretsLeaked(text, envPayload) {
  const secrets = [];
  const collect = (obj) => {
    if (!obj || typeof obj !== "object") return;
    if (typeof obj.password === "string" && obj.password) secrets.push(obj.password);
    if (typeof obj.email === "string" && obj.email) secrets.push(obj.email);
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") collect(v);
    }
  };
  collect(envPayload);
  // Senhas nunca podem aparecer; e-mails fictícios de teste também não devem
  // vazar como valores crus no diagnóstico estrutural (só rótulos de campo).
  for (const secret of secrets) {
    if (typeof secret === "string" && secret.length > 0) {
      assert.equal(
        text.includes(secret),
        false,
        `Saída vazou valor sensível/fictício: ${secret.slice(0, 8)}…`
      );
    }
  }
  assert.equal(/SuaSenhaSegura@123/.test(text), false);
  assert.equal(/SenhaTeste@123/.test(text), false);
  assert.equal(/GateFake-/.test(text), false);
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

describe("check-env placeholders por perfil exigido", () => {
  it("A: login válido + perfis opcionais placeholder → pré-check Login PASS", () => {
    const payload = {
      ...FAKE_OK,
      alunoCompleto: PH_COMPLETO,
      alunoFasePendente: PH_PENDENTE,
      alunoReprovado: PH_REPROVADO,
      emailJaCadastrado: PH_EMAIL_JA,
    };
    const dir = makeEnvDir(payload);
    const r = parseResult(
      runCheckEnv(dir, ["--require-auth", "--reject-placeholders"])
    );
    assert.equal(r.code, 0);
    assert.ok(r.json);
    assert.equal(r.json.blocks.length, 0);
    assert.ok(r.json.placeholderSuspects.length >= 1);
    assert.ok(r.json.warnings.length >= 1);
    assertNoSecretsLeaked(r.stdout + r.stderr, payload);
  });

  it("B: login placeholder → pré-check FAIL", () => {
    const payload = {
      ...PH_FLAT,
      alunoCompleto: FAKE_COMPLETO,
    };
    const dir = makeEnvDir(payload);
    const r = parseResult(
      runCheckEnv(dir, ["--require-auth", "--reject-placeholders"])
    );
    assert.equal(r.code, 1);
    assert.ok(r.json.blocks.some((b) => /email\/password/.test(b)));
    assertNoSecretsLeaked(r.stdout + r.stderr, payload);
  });

  it("C: emailJaCadastrado válido + outros placeholder → Cadastro PASS", () => {
    const payload = {
      ...PH_FLAT,
      alunoCompleto: PH_COMPLETO,
      alunoFasePendente: PH_PENDENTE,
      alunoReprovado: PH_REPROVADO,
      emailJaCadastrado: FAKE_EMAIL_JA,
    };
    const dir = makeEnvDir(payload);
    const r = parseResult(
      runCheckEnv(dir, [
        "--require-email-ja-cadastrado",
        "--reject-placeholders",
      ])
    );
    assert.equal(r.code, 0);
    assert.equal(r.json.blocks.length, 0);
    assert.ok(r.json.warnings.length >= 1);
    assertNoSecretsLeaked(r.stdout + r.stderr, payload);
  });

  it("D: emailJaCadastrado placeholder → FAIL", () => {
    const payload = {
      ...FAKE_OK,
      emailJaCadastrado: PH_EMAIL_JA,
    };
    const dir = makeEnvDir(payload);
    const r = parseResult(
      runCheckEnv(dir, [
        "--require-email-ja-cadastrado",
        "--reject-placeholders",
      ])
    );
    assert.equal(r.code, 1);
    assert.ok(r.json.blocks.some((b) => /emailJaCadastrado/.test(b)));
    assertNoSecretsLeaked(r.stdout + r.stderr, payload);
  });

  it("E: perfis obrigatórios do Exame Final ausentes → FAIL", () => {
    const payload = {
      ...FAKE_OK,
      emailJaCadastrado: FAKE_EMAIL_JA,
    };
    const dir = makeEnvDir(payload);
    const r = parseResult(
      runCheckEnv(dir, [
        "--require-auth",
        "--require-profiles",
        "--reject-placeholders",
      ])
    );
    assert.equal(r.code, 1);
    assert.ok(r.json.blocks.some((b) => /alunoCompleto/.test(b)));
    assert.ok(r.json.blocks.some((b) => /alunoFasePendente/.test(b)));
    assert.ok(r.json.blocks.some((b) => /alunoReprovado/.test(b)));
    assertNoSecretsLeaked(r.stdout + r.stderr, payload);
  });

  it("F: todos os perfis obrigatórios válidos → Final PASS", () => {
    const payload = {
      ...FAKE_OK,
      alunoCompleto: FAKE_COMPLETO,
      alunoFasePendente: FAKE_PENDENTE,
      alunoReprovado: FAKE_REPROVADO,
      emailJaCadastrado: PH_EMAIL_JA,
    };
    const dir = makeEnvDir(payload);
    const r = parseResult(
      runCheckEnv(dir, [
        "--require-auth",
        "--require-profiles",
        "--reject-placeholders",
      ])
    );
    assert.equal(r.code, 0);
    assert.equal(r.json.blocks.length, 0);
    // emailJaCadastrado opcional para Final → aviso, não bloqueio
    assert.ok(
      r.json.warnings.some((w) => /emailJaCadastrado/.test(w)) ||
        r.json.placeholderSuspects.some((p) => p.field === "emailJaCadastrado")
    );
    assertNoSecretsLeaked(r.stdout + r.stderr, payload);
  });

  it("G: --reject-placeholders sem seleção → rejeita qualquer placeholder", () => {
    const payload = {
      ...FAKE_OK,
      alunoCompleto: PH_COMPLETO,
    };
    const dir = makeEnvDir(payload);
    const r = parseResult(runCheckEnv(dir, ["--reject-placeholders"]));
    assert.equal(r.code, 1);
    assert.ok(r.json.blocks.some((b) => /alunoCompleto/.test(b)));
    assertNoSecretsLeaked(r.stdout + r.stderr, payload);
  });

  it("H: JSON inválido → FAIL controlado", () => {
    const dir = makeEnvDir({}, { invalidJson: true });
    const r = parseResult(
      runCheckEnv(dir, ["--require-auth", "--reject-placeholders"])
    );
    assert.equal(r.code, 1);
    assert.ok(r.json);
    assert.ok(r.json.blocks.some((b) => /inválido|malformado/i.test(b)));
    assert.equal(/SuaSenhaSegura@123/.test(r.stdout + r.stderr), false);
  });

  it("I: nenhuma credencial aparece nas saídas (texto e JSON)", () => {
    const payload = {
      ...FAKE_OK,
      alunoCompleto: FAKE_COMPLETO,
      alunoFasePendente: PH_PENDENTE,
      emailJaCadastrado: FAKE_EMAIL_JA,
    };
    const dir = makeEnvDir(payload);

    const jsonRun = parseResult(
      runCheckEnv(dir, [
        "--require-auth",
        "--require-profiles",
        "--reject-placeholders",
      ])
    );
    const textRun = spawnSync(
      process.execPath,
      [SCRIPT, "--require-auth", "--reject-placeholders"],
      { cwd: dir, encoding: "utf8", env: { ...process.env, NO_COLOR: "1" } }
    );
    const combined =
      jsonRun.stdout +
      jsonRun.stderr +
      (textRun.stdout || "") +
      (textRun.stderr || "");
    assertNoSecretsLeaked(combined, payload);
    assert.equal(/password\s*[:=]\s*["']?GateFake/i.test(combined), false);
  });
});
