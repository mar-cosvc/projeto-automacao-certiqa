import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  dadosFronteiraSenha,
  dadosNegativosCadastro,
  gerarEmailUnico,
  gerarLoteEmailsUnicos,
  gerarMassaCadastroPositiva,
  gerarNomeCompleto,
  gerarSenhaValida,
  obterDominioEmail,
} from "../cypress/support/data/massas.mjs";
import {
  extrairCredenciaisDoEnv,
  listarPerfis,
  obterMetaPerfil,
  PERFIS,
} from "../cypress/support/data/perfis.mjs";

const DOMINIO_TESTE = "mass.factory.test";

describe("Mass Factory — geração válida", () => {
  it("gera nome fictício não vazio", () => {
    const nome = gerarNomeCompleto();
    assert.equal(typeof nome, "string");
    assert.ok(nome.trim().length > 0);
  });

  it("gera senha válida com pelo menos 6 caracteres", () => {
    const senha = gerarSenhaValida();
    assert.ok(senha.length >= 6);
  });

  it("gera massa positiva com nome, email e senha", () => {
    const m = gerarMassaCadastroPositiva({ dominio: DOMINIO_TESTE });
    assert.ok(m.nome.trim());
    assert.match(m.email, new RegExp(`@${DOMINIO_TESTE}$`));
    assert.ok(m.senha.length >= 6);
  });

  it("exige domínio autorizado para e-mail persistido", () => {
    delete process.env.CERTIQA_EMAIL_DOMAIN;
    assert.throws(() => obterDominioEmail({}), /emailDomain|Domínio/);
  });
});

describe("Mass Factory — unicidade de e-mail", () => {
  it("gera e-mails distintos em sequência", () => {
    const a = gerarEmailUnico({ dominio: DOMINIO_TESTE });
    const b = gerarEmailUnico({ dominio: DOMINIO_TESTE });
    assert.notEqual(a, b);
  });

  it("lote sem duplicatas", () => {
    const lote = gerarLoteEmailsUnicos(20, { dominio: DOMINIO_TESTE });
    assert.equal(lote.length, 20);
    assert.equal(new Set(lote).size, 20);
  });
});

describe("Mass Factory — dados negativos e fronteira", () => {
  it("expõe negativos alinhados ao cadastro", () => {
    const n = dadosNegativosCadastro();
    assert.equal(n.emailInvalido, "babi@hotmail");
    assert.equal(n.emailSemArroba, "lioutlook.com");
    assert.equal(n.senhaUmCaracter.length, 1);
  });

  it("fronteiras de senha", () => {
    const f = dadosFronteiraSenha();
    assert.ok(f.abaixoDoMinimo.length < 6);
    assert.equal(f.limiarMinimo.length, 6);
    assert.ok(f.valida.length >= 6);
  });
});

describe("Perfis — seleção lógica", () => {
  it("lista os cinco perfis esperados", () => {
    const ids = listarPerfis().sort();
    assert.deepEqual(ids, [
      "alunoCompleto",
      "alunoFasePendente",
      "alunoReprovado",
      "emailJaCadastrado",
      "login",
    ]);
  });

  it("emailJaCadastrado não exige senha real", () => {
    assert.equal(obterMetaPerfil("emailJaCadastrado").exigeSenha, false);
  });

  it("extrai login flat", () => {
    const c = extrairCredenciaisDoEnv("login", {
      email: "a@mass.factory.test",
      password: "Segura123",
    });
    assert.equal(c.email, "a@mass.factory.test");
    assert.equal(c.password, "Segura123");
  });

  it("emailJaCadastrado usa só e-mail e senha fictícia", () => {
    const c = extrairCredenciaisDoEnv("emailJaCadastrado", {
      emailJaCadastrado: { email: "ja@mass.factory.test" },
    });
    assert.equal(c.email, "ja@mass.factory.test");
    assert.ok(c.senhaFicticiaFormulario);
    assert.ok(c.password.length >= 6);
  });

  it("aceita emailJaCadastrado como string", () => {
    const c = extrairCredenciaisDoEnv("emailJaCadastrado", {
      emailJaCadastrado: "ja@mass.factory.test",
    });
    assert.equal(c.email, "ja@mass.factory.test");
  });
});

describe("Mass Factory — ausência de segredos versionados", () => {
  it("massas.mjs e perfis.js não contêm senhas de exemplo reais hardcoded suspeitas", () => {
    const root = path.resolve("cypress/support/data");
    for (const f of ["massas.mjs", "perfis.mjs"]) {
      const src = fs.readFileSync(path.join(root, f), "utf8");
      assert.doesNotMatch(src, /marcosvcarneiro|hotmail\.com|yahoo\.com/i);
      assert.equal(src.includes("SuaSenhaSegura@123"), false);
    }
  });

  it("PERFIS não embute e-mails de conta", () => {
    const blob = JSON.stringify(PERFIS);
    assert.doesNotMatch(blob, /@/);
  });
});
