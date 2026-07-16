function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function evidenceSupportToLikelihoodRatio(
  evidenceSupport: number,
): number {
  const centeredSupport = (clamp(evidenceSupport, 0, 100) - 50) / 25;

  return 2 ** centeredSupport;
}

export function calculatePosteriorPercent(
  priorPercent: number,
  evidenceSupport: number,
): number {
  const priorProbability = clamp(priorPercent, 5, 95) / 100;
  const priorOdds = priorProbability / (1 - priorProbability);
  const posteriorOdds =
    priorOdds * evidenceSupportToLikelihoodRatio(evidenceSupport);

  return Math.round((posteriorOdds / (1 + posteriorOdds)) * 100);
}
