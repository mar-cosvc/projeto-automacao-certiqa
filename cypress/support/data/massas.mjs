/**
 * Mass Factory — geração centralizada de dados fictícios para BDD/Cypress.
 * Analogia: Page Object encapsula a UI; Mass Factory encapsula a massa.
 *
 * Funções puras: sem dependência do objeto `cy` / Cypress.env.
 * Domínio de e-mail para cadastro persistido deve ser passado explicitamente
 * ({ dominio }) ou via CERTIQA_EMAIL_DOMAIN (unitários Node).
 * Nos steps Cypress, o domínio vem de cy.env(["emailDomain"]).
 */

import { faker } from "@faker-js/faker/locale/pt_BR";

const SENHA_MINIMA_VALIDA = "Qa1234"; // >= 6 caracteres (regra do cadastro)

/**
 * Resolve domínio autorizado para e-mails de cadastro persistido.
 * @param {{ dominio?: string }} [opts]
 */
export function obterDominioEmail(opts = {}) {
  const direto = opts.dominio && String(opts.dominio).trim();
  if (direto) return direto.replace(/^@/, "");

  const fromProcess =
    typeof process !== "undefined" && process.env
      ? process.env.CERTIQA_EMAIL_DOMAIN
      : undefined;

  const dominio = String(fromProcess || "")
    .trim()
    .replace(/^@/, "");

  if (!dominio) {
    throw new Error(
      'Domínio de e-mail não configurado. Defina "emailDomain" em cypress.env.json ' +
        "(domínio autorizado pelo time) e passe { dominio } a partir de cy.env([\"emailDomain\"]), " +
        "ou use CERTIQA_EMAIL_DOMAIN nos unitários. " +
        "Não assuma que @exemplo.test será aceito pelo backend."
    );
  }

  return dominio;
}

export function gerarNomeCompleto() {
  return faker.person.fullName();
}

export function gerarPrimeiroNome() {
  return faker.person.firstName();
}

/** Senha fictícia válida (>= 6 caracteres). Nunca é credencial real. */
export function gerarSenhaValida() {
  return `${SENHA_MINIMA_VALIDA}${faker.string.alphanumeric(4)}`;
}

/** Senha no limiar mínimo documentado pelo cadastro. */
export function gerarSenhaLimiarMinimo() {
  return "123456";
}

export function gerarSenhaCurta() {
  return "2";
}

/**
 * E-mail único para cadastro (evita colisão entre integrantes).
 * @param {{ dominio?: string, prefixo?: string }} [opts]
 */
export function gerarEmailUnico(opts = {}) {
  const dominio = obterDominioEmail(opts);
  const prefixo = (opts.prefixo || "certiqa").toLowerCase();
  const stamp = Date.now();
  const rand = faker.string.alphanumeric(8).toLowerCase();
  return `${prefixo}.${stamp}.${rand}@${dominio}`;
}

/**
 * Massa positiva completa para cadastro com sucesso.
 * @param {{ dominio?: string, nome?: string }} [opts]
 */
export function gerarMassaCadastroPositiva(opts = {}) {
  return {
    nome: opts.nome || gerarNomeCompleto(),
    email: gerarEmailUnico(opts),
    senha: gerarSenhaValida(),
  };
}

/** Dados negativos reutilizáveis (não dependem de domínio autorizado). */
export function dadosNegativosCadastro() {
  return {
    nomeEmBranco: " ",
    nomeSomentePrimeiro: "Lilu",
    nomeComNumeros: "1234559",
    emailVazio: " ",
    emailInvalido: "babi@hotmail",
    emailSemArroba: "lioutlook.com",
    senhaUmCaracter: gerarSenhaCurta(),
  };
}

/** Fronteiras de senha alinhadas aos cenários existentes. */
export function dadosFronteiraSenha() {
  return {
    abaixoDoMinimo: gerarSenhaCurta(),
    limiarMinimo: gerarSenhaLimiarMinimo(),
    valida: gerarSenhaValida(),
  };
}

/**
 * Gera N e-mails e garante unicidade no lote.
 * @param {number} quantidade
 * @param {{ dominio?: string }} [opts]
 */
export function gerarLoteEmailsUnicos(quantidade, opts = {}) {
  const n = Number(quantidade);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`quantidade inválida: ${quantidade}`);
  }
  const set = new Set();
  while (set.size < n) {
    set.add(gerarEmailUnico(opts));
  }
  return [...set];
}

/**
 * Estado temporário isolado por cenário (senha fictícia de duplicidade).
 * Não usa Cypress.env / cy.env para gravar senha.
 */
export function criarEstadoCenarioCadastro() {
  /** @type {string|null} */
  let senhaDuplicidade = null;

  return {
    limpar() {
      senhaDuplicidade = null;
    },
    /**
     * @param {string} senha
     * @returns {string}
     */
    guardarSenhaDuplicidade(senha) {
      const s = String(senha || "");
      if (s.length < 6) {
        throw new Error("Senha fictícia de duplicidade inválida (< 6 caracteres).");
      }
      senhaDuplicidade = s;
      return s;
    },
    /**
     * @returns {string}
     */
    obterSenhaDuplicidade() {
      if (senhaDuplicidade == null) {
        throw new Error(
          "Senha temporária de duplicidade ausente — preencha a senha antes da confirmação no mesmo cenário."
        );
      }
      return senhaDuplicidade;
    },
  };
}
