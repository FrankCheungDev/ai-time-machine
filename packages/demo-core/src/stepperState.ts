export function getPreviousStepIndex(currentIndex: number): number {
  return Math.max(0, currentIndex - 1);
}

export function getNextStepIndex(
  currentIndex: number,
  stepCount: number,
): number {
  const lastIndex = Math.max(0, stepCount - 1);
  return Math.min(lastIndex, currentIndex + 1);
}
