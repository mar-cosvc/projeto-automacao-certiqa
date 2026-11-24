/**
 * Perfis lógicos de massa persistida (contas provisionadas pelo time).
 * Credenciais vêm só de cypress.env.json via cy.env() (Cypress 16).
 * Nenhum segredo real é versionado neste arquivo.
 */

import { gerarSenhaValida } from "./massas.mjs";

/** Identificadores estáveis usados nos steps / commands. */
export const PERFIS = Object.freeze({
  login: {
    id: "login",
    chavesEnv: ["email", "password"],
    aninhado: false,
    exigeSenha: true,
    descricao: "Conta flat para Login e Exames de Fase (cy.login()).",
  },
  emailJaCadastrado: {
    id: "emailJaCadastrado",
    chavesEnv: ["emailJaCadastrado"],
    aninhado: true,
    /** O backend rejeita pelo e-mail; senha do formulário pode ser fictícia. */
    exigeSenha: false,
    descricao: "E-mail já existente para cenário negativo de cadastro.",
  },
  alunoCompleto: {
    id: "alunoCompleto",
    chavesEnv: ["alunoCompleto"],
    aninhado: true,
    exigeSenha: true,
    descricao: "Aluno com fases concluídas — Exame Final.",
  },
  alunoFasePendente: {
    id: "alunoFasePendente",
    chavesEnv: ["alunoFasePendente"],
    aninhado: true,
    exigeSenha: true,
    descricao: "Aluno com fase pendente — bloqueio do Exame Final.",
  },
  alunoReprovado: {
    id: "alunoReprovado",
    chavesEnv: ["alunoReprovado"],
    aninhado: true,
    exigeSenha: true,
    descricao: "Aluno com reprovação residual — bloqueio do Exame Final.",
  },
});

export function listarPerfis() {
  return Object.keys(PERFIS);
}

export function obterMetaPerfil(perfilId) {
  const meta = PERFIS[perfilId];
  if (!meta) {
    throw new Error(
      `Perfil desconhecido: "${perfilId}". Use um de: ${listarPerfis().join(", ")}.`
    );
  }
  return meta;
}

/**
 * Extrai e-mail (e senha se exigida) de um payload de env já resolvido.
 * Função pura — usada em unitários e no callback de cy.env().
 */
export function extrairCredenciaisDoEnv(perfilId, envPayload) {
  const meta = obterMetaPerfil(perfilId);
  const env = envPayload || {};

  if (!meta.aninhado) {
    const email = env.email;
    const password = env.password;
    if (typeof email !== "string" || !email.trim()) {
      throw new Error(
        'Configure "email" em cypress.env.json para o perfil login.'
      );
    }
    if (meta.exigeSenha && (typeof password !== "string" || !password.trim())) {
      throw new Error(
        'Configure "password" em cypress.env.json para o perfil login.'
      );
    }
    return { email: email.trim(), password: password?.trim() };
  }

  const raw = env[meta.id];
  if (typeof raw === "string") {
    if (!raw.trim()) {
      throw new Error(`Configure "${meta.id}" em cypress.env.json.`);
    }
    return {
      email: raw.trim(),
      password: meta.exigeSenha ? undefined : gerarSenhaValida(),
      senhaFicticiaFormulario: !meta.exigeSenha,
    };
  }

  const email = raw?.email;
  if (typeof email !== "string" || !email.trim()) {
    throw new Error(
      `Configure "${meta.id}.email" em cypress.env.json.`
    );
  }

  if (meta.exigeSenha) {
    const password = raw?.password;
    if (typeof password !== "string" || !password.trim()) {
      throw new Error(
        `Configure "${meta.id}.password" em cypress.env.json.`
      );
    }
    return { email: email.trim(), password: password.trim() };
  }

  // emailJaCadastrado: senha do formulário é fictícia (não a senha real da conta).
  return {
    email: email.trim(),
    password: gerarSenhaValida(),
    senhaFicticiaFormulario: true,
  };
}

/**
 * Carrega credenciais via cy.env([...]).then — Cypress 16.
 * @param {string} perfilId
 * @returns {Cypress.Chainable<{email: string, password?: string, senhaFicticiaFormulario?: boolean}>}
 */
export function carregarCredenciais(perfilId) {
  const meta = obterMetaPerfil(perfilId);
  return cy.env(meta.chavesEnv).then((env) => extrairCredenciaisDoEnv(perfilId, env));
}
