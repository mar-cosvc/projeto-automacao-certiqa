import fs from "node:fs";
import path from "node:path";

/**
 * Pré-checagem de cypress.env.json sem imprimir segredos.
 *
 * Uso:
 *   node scripts/check-env.mjs
 *   node scripts/check-env.mjs --require-auth
 *   node scripts/check-env.mjs --require-profiles
 *   node scripts/check-env.mjs --require-email-ja-cadastrado
 *   node scripts/check-env.mjs --require-email-domain
 *   node scripts/check-env.mjs --reject-placeholders
 *   node scripts/check-env.mjs --json
 *
 * Com --reject-placeholders + flags --require-*:
 *   rejeita placeholders somente da união dos perfis/campos exigidos.
 * Com --reject-placeholders isolado:
 *   validação global (qualquer placeholder conhecido bloqueia).
 * --require-email-domain (Cadastro):
 *   exige domínio presente, sintaticamente válido e não-placeholder.
 *   Não bloqueia Login / Exame Final por ausência de emailDomain.
 * Campos opcionais para a etapa ainda entram no diagnóstico (avisos),
 * mas não bloqueiam.
 * Domínio configurado ≠ autorização de execução mutável.
 */

const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const requireAuth = args.has("--require-auth");
const requireProfiles = args.has("--require-profiles");
const requireEmailJa = args.has("--require-email-ja-cadastrado");
const requireEmailDomain = args.has("--require-email-domain");
const rejectPlaceholders = args.has("--reject-placeholders");

const envPath = path.resolve("cypress.env.json");
const examplePath = path.resolve("cypress.env.example.json");

const PROFILE_KEYS = [
  "alunoCompleto",
  "alunoFasePendente",
  "alunoReprovado",
  "emailJaCadastrado",
];

const result = {
  envFileExists: fs.existsSync(envPath),
  exampleExists: fs.existsSync(examplePath),
  formatOk: false,
  hasFlatCredentials: false,
  hasEmailDomain: false,
  emailDomainValid: false,
  emailDomainPlaceholder: false,
  profiles: {
    alunoCompleto: false,
    alunoFasePendente: false,
    alunoReprovado: false,
    emailJaCadastrado: false,
  },
  placeholderSuspects: [],
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

/** emailJaCadastrado: basta o e-mail (senha do form é fictícia na Mass Factory). */
function hasEmailOnly(value) {
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value && typeof value.email === "string" && value.email.trim());
}

/** Detecta placeholders conhecidos sem expor o valor. */
function looksLikePlaceholder(email, password) {
  const e = String(email || "").toLowerCase();
  const p = String(password || "");
  if (/@exemplo\.test$/i.test(e)) return "dominio_exemplo_test";
  if (
    /seu\.usuario|aluno\.completo|aluno\.fase\.pendente|aluno\.reprovado|usuario\.ja\.cadastrado/i.test(
      e
    )
  ) {
    return "email_placeholder";
  }
  if (
    p === "SuaSenhaSegura@123" ||
    p === "SenhaTeste@123" ||
    /^sua.?senha/i.test(p)
  ) {
    return "senha_placeholder";
  }
  return null;
}

/**
 * Domínio de e-mail sintaticamente válido (FQDN simples, sem @user).
 * @param {string} raw
 */
function isValidEmailDomain(raw) {
  const d = String(raw || "")
    .trim()
    .replace(/^@/, "");
  if (!d || d.length > 253) return false;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(
    d
  );
}

/**
 * Placeholders documentados de emailDomain (example / legado).
 * @param {string} raw
 */
function isPlaceholderEmailDomain(raw) {
  const d = String(raw || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
  if (!d) return false;
  if (d === "exemplo.test" || d.endsWith(".exemplo.test")) return true;
  if (d === "dominio-autorizado.do.time") return true;
  return false;
}

/**
 * Escopo de campos cujo placeholder bloqueia com --reject-placeholders.
 * - Sem flags --require-*: "all" (rigor global).
 * - Com uma ou mais --require-*: união dos campos exigidos.
 * - Sem --reject-placeholders: null (nunca bloqueia por placeholder).
 * @returns {"all"|Set<string>|null}
 */
function placeholderBlockScope() {
  if (!rejectPlaceholders) return null;
  const anyRequire =
    requireAuth || requireProfiles || requireEmailJa || requireEmailDomain;
  if (!anyRequire) return "all";

  const fields = new Set();
  if (requireAuth) fields.add("email/password");
  if (requireProfiles) {
    fields.add("alunoCompleto");
    fields.add("alunoFasePendente");
    fields.add("alunoReprovado");
  }
  if (requireEmailJa) fields.add("emailJaCadastrado");
  if (requireEmailDomain) fields.add("emailDomain");
  return fields;
}

const blockScope = placeholderBlockScope();

function notePlaceholder(label, email, password) {
  const kind = looksLikePlaceholder(email, password);
  if (!kind) return;

  result.placeholderSuspects.push({ field: label, kind });
  const msg = `Campo "${label}" parece placeholder (${kind}). Substitua por conta autorizada real antes do E2E.`;

  const shouldBlock =
    blockScope === "all" ||
    (blockScope instanceof Set && blockScope.has(label));

  if (shouldBlock) result.blocks.push(msg);
  else result.warnings.push(msg);
}

if (!result.envFileExists) {
  result.blocks.push(
    "Arquivo cypress.env.json ausente. Copie de cypress.env.example.json e preencha com contas autorizadas."
  );
} else {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(envPath, "utf8"));
    result.formatOk =
      data !== null && typeof data === "object" && !Array.isArray(data);
  } catch {
    result.blocks.push("cypress.env.json inválido (JSON malformado).");
  }

  if (result.formatOk) {
    const rawDomain =
      typeof data.emailDomain === "string" ? data.emailDomain.trim() : "";
    result.hasEmailDomain = rawDomain.length > 0;
    result.emailDomainValid =
      result.hasEmailDomain && isValidEmailDomain(rawDomain);
    result.emailDomainPlaceholder =
      result.hasEmailDomain && isPlaceholderEmailDomain(rawDomain);

    if (!result.hasEmailDomain) {
      result.warnings.push(
        'Campo "emailDomain" ausente — necessário para Mass Factory gerar e-mails de cadastro com domínio autorizado.'
      );
    } else if (!result.emailDomainValid) {
      result.warnings.push(
        'Campo "emailDomain" sintaticamente inválido — informe um domínio FQDN autorizado (ex.: time.exemplo.org).'
      );
    } else if (result.emailDomainPlaceholder) {
      // exemplo.test cai em looksLikePlaceholder; demais placeholders documentados, aqui.
      const probe = `probe@${rawDomain.replace(/^@/, "")}`;
      const kindFromEmail = looksLikePlaceholder(probe, "");
      if (kindFromEmail) {
        notePlaceholder("emailDomain", probe, "");
      } else {
        result.placeholderSuspects.push({
          field: "emailDomain",
          kind: "dominio_placeholder_documentado",
        });
        const msg =
          'Campo "emailDomain" parece placeholder documentado. Substitua por domínio autorizado real antes do Cadastro.';
        const shouldBlock =
          blockScope === "all" ||
          (blockScope instanceof Set && blockScope.has("emailDomain"));
        if (shouldBlock) result.blocks.push(msg);
        else result.warnings.push(msg);
      }
    }

    result.hasFlatCredentials = hasCred(data);
    if (result.hasFlatCredentials) {
      notePlaceholder("email/password", data.email, data.password);
    }

    // Perfis autenticados exigem email+password (G5-R3).
    for (const key of ["alunoCompleto", "alunoFasePendente", "alunoReprovado"]) {
      result.profiles[key] = hasCred(data[key]);
      if (result.profiles[key]) {
        notePlaceholder(key, data[key].email, data[key].password);
      }
    }

    // emailJaCadastrado: apenas e-mail (G6 Mass Factory — senha do form é fictícia).
    result.profiles.emailJaCadastrado = hasEmailOnly(data.emailJaCadastrado);
    if (result.profiles.emailJaCadastrado) {
      const emailJa =
        typeof data.emailJaCadastrado === "string"
          ? data.emailJaCadastrado
          : data.emailJaCadastrado.email;
      notePlaceholder("emailJaCadastrado", emailJa, "");
      if (
        typeof data.emailJaCadastrado === "object" &&
        data.emailJaCadastrado.password
      ) {
        result.warnings.push(
          'emailJaCadastrado.password é opcional: o cenário usa senha fictícia da Mass Factory (duplicidade valida só o e-mail).'
        );
      }
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

if (requireEmailDomain) {
  if (!result.hasEmailDomain) {
    result.blocks.push(
      'Campo "emailDomain" ausente — bloqueia Cadastro (Mass Factory precisa de domínio autorizado).'
    );
  } else if (!result.emailDomainValid) {
    result.blocks.push(
      'Campo "emailDomain" sintaticamente inválido — bloqueia Cadastro.'
    );
  } else if (result.emailDomainPlaceholder) {
    // Garante bloqueio mesmo sem --reject-placeholders (pré-condição Cadastro).
    const already = result.blocks.some((b) => /emailDomain/.test(b));
    if (!already) {
      result.blocks.push(
        'Campo "emailDomain" parece placeholder documentado — bloqueia Cadastro.'
      );
    }
  }
}

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("=== CERTIQA — check-env ===");
  console.log(
    `cypress.env.json: ${result.envFileExists ? "presente" : "AUSENTE"}`
  );
  console.log(`formato JSON: ${result.formatOk ? "ok" : "falhou/ausente"}`);
  console.log(
    `credenciais flat (login): ${result.hasFlatCredentials ? "ok" : "ausentes"}`
  );
  console.log(
    `emailDomain (Mass Factory): ${result.hasEmailDomain ? "ok" : "ausente"}`
  );
  for (const [k, v] of Object.entries(result.profiles)) {
    console.log(`perfil ${k}: ${v ? "ok" : "ausente"}`);
  }
  if (result.placeholderSuspects.length) {
    console.log(
      `placeholders suspeitos: ${result.placeholderSuspects.length} campo(s)`
    );
  }
  for (const w of result.warnings) console.log(`AVISO: ${w}`);
  for (const b of result.blocks) console.log(`BLOQUEIO: ${b}`);
  if (!result.blocks.length) {
    console.log("Pré-checagem concluída sem bloqueios solicitados.");
  }
}

process.exit(result.blocks.length ? 1 : 0);
