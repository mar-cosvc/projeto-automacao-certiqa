/**
 * Regras puras de proteção da suíte CERTIQA (sem I/O de rede).
 * Usadas pelo orquestrador e por testes isolados.
 */

export const STAGE_ORDER = [
  "static",
  "unit",
  "smoke",
  "login",
  "cadastro",
  "fases",
  "final",
];

export const GATE_KINDS = {
  static: "STATIC",
  unit: "STATIC",
  smoke: "READ_ONLY",
  login: "AUTH",
  cadastro: "MUTATING",
  fases: "AUTH+MUTATING",
  final: "AUTH+MUTATING",
};

/** Etapas que exigem infra anterior íntegra (static/unit/smoke PASS). */
export const SENSITIVE_STAGES = new Set(["login", "cadastro", "fases", "final"]);

/** Etapas mutáveis na plataforma. */
export const MUTATING_STAGES = new Set(["cadastro", "fases", "final"]);

/**
 * @param {{ auth?: boolean, mutating?: boolean }} flags
 * @param {string[]} requires
 */
export function isAuthorized(flags, requires = []) {
  const auth = Boolean(flags?.auth);
  const mutating = Boolean(flags?.mutating);
  if (requires.includes("auth") && !auth) return false;
  if (requires.includes("mutating") && !mutating) return false;
  return true;
}

/**
 * Após FAIL em static/unit/smoke, etapas sensíveis não podem executar.
 * @param {Array<{ id: string, status: string }>} completedStages
 */
export function infraBlocked(completedStages = []) {
  const infraIds = new Set(["static", "unit", "smoke"]);
  return completedStages.some(
    (s) => infraIds.has(s.id) && s.status === "FAIL"
  );
}

/**
 * Decide se a etapa pode rodar, deve HOLD ou deve ser bloqueada.
 * @returns {{ action: "RUN"|"HOLD"|"BLOCK", reason?: string }}
 */
export function decideStageGate({
  stageId,
  requires = [],
  flags = {},
  completedStages = [],
  precheckOk = true,
  massConfirmed = false,
  envReady = true,
}) {
  if (SENSITIVE_STAGES.has(stageId) && infraBlocked(completedStages)) {
    return {
      action: "BLOCK",
      reason:
        "Infraestrutura anterior falhou (static/unit/smoke). Etapas AUTH/MUTATING bloqueadas.",
    };
  }

  if (requires.length && !isAuthorized(flags, requires)) {
    return {
      action: "HOLD",
      reason:
        "Sem autorização de execução (defina CERTIQA_ALLOW_AUTH=1 e/ou CERTIQA_ALLOW_MUTATING=1).",
    };
  }

  if (!envReady || !precheckOk) {
    return {
      action: "HOLD",
      reason:
        "Pré-condições de ambiente/massa não atendidas (check-env / massa confirmada).",
    };
  }

  // Fases e Final exigem confirmação humana de estado das contas.
  if (
    (stageId === "fases" || stageId === "final") &&
    !massConfirmed
  ) {
    return {
      action: "HOLD",
      reason:
        "Massa/estado não confirmados. Defina CERTIQA_MASS_CONFIRMED=1 após validar pré-condições dos perfis.",
    };
  }

  return { action: "RUN" };
}

/**
 * Status funcional agregado. HOLD/SKIP nunca viram PASS.
 * @param {{ PASS?: number, FAIL?: number, HOLD?: number, SKIP?: number, BLOCK?: number }} counts
 */
export function suiteFunctionalStatus(counts = {}) {
  const fail = counts.FAIL || 0;
  const hold = (counts.HOLD || 0) + (counts.SKIP || 0) + (counts.BLOCK || 0);
  if (fail > 0) return "FAIL";
  if (hold > 0) return "HOLD";
  return "PASS";
}

/**
 * Status técnico do processo: falha se houver FAIL ou BLOCK de infra.
 */
export function processExitFromCounts(counts = {}) {
  if ((counts.FAIL || 0) > 0 || (counts.BLOCK || 0) > 0) return 1;
  return 0;
}

/**
 * Pré-checagens exigidas por etapa (flags para check-env).
 */
export function precheckFlagsForStage(stageId) {
  switch (stageId) {
    case "login":
      return ["--require-auth", "--reject-placeholders"];
    case "cadastro":
      return ["--require-email-ja-cadastrado", "--reject-placeholders"];
    case "fases":
      return ["--require-auth", "--reject-placeholders"];
    case "final":
      return [
        "--require-auth",
        "--require-profiles",
        "--reject-placeholders",
      ];
    default:
      return [];
  }
}

export function requiresForStage(stageId) {
  switch (stageId) {
    case "login":
      return ["auth"];
    case "cadastro":
      return ["mutating"];
    case "fases":
    case "final":
      return ["auth", "mutating"];
    default:
      return [];
  }
}
