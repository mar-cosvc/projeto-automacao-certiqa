import fs from "node:fs";
import path from "node:path";

/**
 * Pré-checagem de cypress.env.json sem imprimir segredos.
 *
 * Uso:
 *   node scripts/check-env.mjs                  # só valida existência/formato
 *   node scripts/check-env.mjs --require-auth    # exige email/password
 *   node scripts/check-env.mjs --require-profiles
 *   node scripts/check-env.mjs --require-email-ja-cadastrado
 *   node scripts/check-env.mjs --json
 */

const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const requireAuth = args.has("--require-auth");
const requireProfiles = args.has("--require-profiles");
const requireEmailJa = args.has("--require-email-ja-cadastrado");

const envPath = path.resolve("cypress.env.json");
const examplePath = path.resolve("cypress.env.example.json");

const result = {
  envFileExists: fs.existsSync(envPath),
  exampleExists: fs.existsSync(examplePath),
  formatOk: false,
  hasFlatCredentials: false,
  profiles: {
    alunoCompleto: false,
    alunoFasePendente: false,
    alunoReprovado: false,
    emailJaCadastrado: false,
  },
  blocks: [],
  warnings: [],
};

function hasCred(obj) {
  return (
    obj &&
    typeof obj.email === "string" &&
    obj.email.trim().length > 0 &&
    typeof obj.password === "string" &&
    obj.password.trim().length > 0
  );
}

if (!result.envFileExists) {
  result.blocks.push(
    "Arquivo cypress.env.json ausente. Copie de cypress.env.example.json e preencha com contas autorizadas."
  );
} else {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(envPath, "utf8"));
    result.formatOk = data !== null && typeof data === "object" && !Array.isArray(data);
  } catch {
    result.blocks.push("cypress.env.json inválido (JSON malformado).");
  }

  if (result.formatOk) {
    result.hasFlatCredentials = hasCred(data);

    for (const key of [
      "alunoCompleto",
      "alunoFasePendente",
      "alunoReprovado",
      "emailJaCadastrado",
    ]) {
      result.profiles[key] = hasCred(data[key]);
    }

    // Compatibilidade: emailJaCadastrado pode ser string no legado G1/G2
    if (
      !result.profiles.emailJaCadastrado &&
      typeof data.emailJaCadastrado === "string" &&
      data.emailJaCadastrado.trim()
    ) {
      result.profiles.emailJaCadastrado = true;
      result.warnings.push(
        'Perfil "emailJaCadastrado" está como string. Prefira o formato objeto { email, password } do exemplo atual.'
      );
    }

    if (typeof data.email === "string" && /@exemplo\.test$/i.test(data.email)) {
      result.warnings.push(
        "Domínio @exemplo.test detectado. Se o backend rejeitar, use um domínio autorizado pelo time (não commitar)."
      );
    }
  }
}

if (requireAuth && !result.hasFlatCredentials) {
  result.blocks.push(
    'Credenciais flat "email"/"password" ausentes — bloqueia Login autenticado e Exames de Fase.'
  );
}

if (requireProfiles) {
  for (const key of ["alunoCompleto", "alunoFasePendente", "alunoReprovado"]) {
    if (!result.profiles[key]) {
      result.blocks.push(
        `Perfil "${key}" ausente ou incompleto — necessário para Exame Final.`
      );
    }
  }
}

if (requireEmailJa && !result.profiles.emailJaCadastrado) {
  result.blocks.push(
    'Perfil "emailJaCadastrado" ausente — bloqueia cenário de e-mail já cadastrado.'
  );
}

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("=== CERTIQA — check-env ===");
  console.log(`cypress.env.json: ${result.envFileExists ? "presente" : "AUSENTE"}`);
  console.log(`formato JSON: ${result.formatOk ? "ok" : "falhou/ausente"}`);
  console.log(
    `credenciais flat (login): ${result.hasFlatCredentials ? "ok" : "ausentes"}`
  );
  for (const [k, v] of Object.entries(result.profiles)) {
    console.log(`perfil ${k}: ${v ? "ok" : "ausente"}`);
  }
  for (const w of result.warnings) console.log(`AVISO: ${w}`);
  for (const b of result.blocks) console.log(`BLOQUEIO: ${b}`);
  if (!result.blocks.length) console.log("Pré-checagem concluída sem bloqueios solicitados.");
}

process.exit(result.blocks.length ? 1 : 0);
