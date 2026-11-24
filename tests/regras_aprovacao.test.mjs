import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  minimoAcertos,
  maximoErrosParaAprovacao,
  errosPorClasse,
  resultadoAprovacao,
  classeAPartirDoNome,
} from "../cypress/support/utils/regras_aprovacao.mjs";

const FASE = 0.7;
const FINAL = 0.8;

describe("CertiQA — Exame Final 80% (40 questões)", () => {
  it("mínimo de aprovação é 32 acertos", () => {
    assert.equal(minimoAcertos(40, FINAL), 32);
    assert.equal(maximoErrosParaAprovacao(40, FINAL), 8);
  });

  it("fronteiras: 31 REPROVADO, 32 e 33 APROVADO", () => {
    assert.equal(resultadoAprovacao(31, 40, FINAL), "REPROVADO");
    assert.equal(resultadoAprovacao(32, 40, FINAL), "APROVADO");
    assert.equal(resultadoAprovacao(33, 40, FINAL), "APROVADO");
  });

  it("classes inferior/igual/superior são determinísticas", () => {
    assert.equal(errosPorClasse(40, FINAL, "inferior"), 9); // 31 acertos
    assert.equal(errosPorClasse(40, FINAL, "igual"), 8); // 32 acertos
    assert.equal(errosPorClasse(40, FINAL, "superior"), 7); // 33 acertos
    assert.equal(errosPorClasse(40, FINAL, "100%"), 0);
  });

  it("acertos derivados das classes batem as fronteiras", () => {
    const total = 40;
    for (const [classe, acertosEsperados, resultado] of [
      ["inferior", 31, "REPROVADO"],
      ["igual", 32, "APROVADO"],
      ["superior", 33, "APROVADO"],
    ]) {
      const erros = errosPorClasse(total, FINAL, classe);
      const acertos = total - erros;
      assert.equal(acertos, acertosEsperados, classe);
      assert.equal(resultadoAprovacao(acertos, total, FINAL), resultado, classe);
    }
  });
});

describe("CertiQA — Exames de Fase 70%", () => {
  it("usa Math.ceil para o mínimo de acertos", () => {
    assert.equal(minimoAcertos(10, FASE), 7);
    assert.equal(minimoAcertos(11, FASE), 8);
    assert.equal(minimoAcertos(15, FASE), 11);
  });

  it("classes determinísticas em fase com 10 questões", () => {
    assert.equal(errosPorClasse(10, FASE, "inferior"), 4); // 6 acertos < 7
    assert.equal(errosPorClasse(10, FASE, "igual"), 3); // 7 acertos
    assert.equal(errosPorClasse(10, FASE, "superior"), 2); // 8 acertos
  });

  it("igual está exatamente no limiar de aprovação", () => {
    const total = 10;
    const erros = errosPorClasse(total, FASE, "igual");
    const acertos = total - erros;
    assert.equal(acertos, minimoAcertos(total, FASE));
    assert.equal(resultadoAprovacao(acertos, total, FASE), "APROVADO");
    assert.equal(
      resultadoAprovacao(acertos - 1, total, FASE),
      "REPROVADO"
    );
  });
});

describe("classeAPartirDoNome", () => {
  it("reconhece títulos do Esquema do Exame Final", () => {
    assert.equal(
      classeAPartirDoNome(
        'Finalizar o Exame Final com pontuação "inferior" a 80%'
      ),
      "inferior"
    );
    assert.equal(
      classeAPartirDoNome(
        'Finalizar o Exame Final com pontuação "igual" a 80%'
      ),
      "igual"
    );
    assert.equal(
      classeAPartirDoNome(
        'Finalizar o Exame Final com pontuação "superior" a 80%'
      ),
      "superior"
    );
  });

  it("retorna null quando não há classe reconhecível", () => {
    assert.equal(classeAPartirDoNome("Acessar a página de login"), null);
  });
});
