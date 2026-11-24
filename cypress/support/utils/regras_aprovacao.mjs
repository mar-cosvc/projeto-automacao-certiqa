/**
 * Regras de aprovação da plataforma CertiQA (não ISTQB oficial).
 * Exames de Fase: 70%. Exame Final: 80%.
 *
 * Utilitário isolado para auditoria e testes unitários.
 * Os Page Objects das PRs aprovadas mantêm a lógica embutida equivalente;
 * este módulo documenta e valida as mesmas fronteiras sem substituí-los.
 */

export function minimoAcertos(totalQuestoes, porcAprovacao) {
  if (!Number.isInteger(totalQuestoes) || totalQuestoes < 1) {
    throw new Error(`totalQuestoes inválido: ${totalQuestoes}`);
  }
  if (!(porcAprovacao > 0 && porcAprovacao <= 1)) {
    throw new Error(`porcAprovacao inválido: ${porcAprovacao}`);
  }
  return Math.ceil(totalQuestoes * porcAprovacao);
}

export function maximoErrosParaAprovacao(totalQuestoes, porcAprovacao) {
  return totalQuestoes - minimoAcertos(totalQuestoes, porcAprovacao);
}

/**
 * @param {"inferior"|"igual"|"superior"|"100%"} classe
 * @returns {number} quantidade determinística de respostas incorretas
 */
export function errosPorClasse(totalQuestoes, porcAprovacao, classe) {
  const limite = maximoErrosParaAprovacao(totalQuestoes, porcAprovacao);

  switch (classe) {
    case "inferior":
      return Math.min(limite + 1, totalQuestoes);
    case "igual":
      return limite;
    case "superior":
      return Math.max(limite - 1, 0);
    case "100%":
      return 0;
    default:
      throw new Error(`Classe de pontuação inválida: "${classe}"`);
  }
}

export function resultadoAprovacao(acertos, totalQuestoes, porcAprovacao) {
  return acertos >= minimoAcertos(totalQuestoes, porcAprovacao)
    ? "APROVADO"
    : "REPROVADO";
}

/**
 * Extrai a classe de pontuação a partir do nome do cenário Gherkin.
 * Preferir parâmetros de Esquema quando disponíveis; fallback para o título.
 */
export function classeAPartirDoNome(nomeCenario) {
  const nome = String(nomeCenario || "");
  if (nome.includes("inferior")) return "inferior";
  if (nome.includes("igual") || nome.includes("Concluir exame com sucesso")) {
    return "igual";
  }
  if (nome.includes("superior") || nome.includes("Concluir fase com sucesso")) {
    return "superior";
  }
  if (nome.includes("100%")) return "100%";
  return null;
}
