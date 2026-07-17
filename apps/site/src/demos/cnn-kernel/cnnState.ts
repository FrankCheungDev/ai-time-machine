import type { CnnKernel, CnnScanStep } from "@ai-history/demo-core";

type ScanPosition = Pick<CnnScanStep, "x" | "y">;
type CalculationKernel = Pick<CnnKernel, "matrix" | "normalizationDivisor">;

export interface CnnWindowResult {
  weightedSum: number;
  normalizationDivisor: number;
  response: number;
}

function assertValidNormalizationDivisor(divisor: number): void {
  if (!Number.isFinite(divisor) || divisor <= 0) {
    throw new RangeError(
      "The CNN normalization divisor must be a finite number greater than zero.",
    );
  }
}

function assertValidScanPosition(step: ScanPosition): void {
  if (
    !Number.isInteger(step.x) ||
    !Number.isInteger(step.y) ||
    step.x < 0 ||
    step.y < 0
  ) {
    throw new RangeError(
      "The CNN scan position must use non-negative integer coordinates.",
    );
  }
}

export function calculateWindowResult(
  imageGrid: number[][],
  kernel: CalculationKernel,
  step: ScanPosition,
): CnnWindowResult {
  assertValidNormalizationDivisor(kernel.normalizationDivisor);
  assertValidScanPosition(step);

  const weightedSum = kernel.matrix
    .flatMap((row, y) =>
      row.map((weight, x) => {
        const imageValue = imageGrid[step.y + y]?.[step.x + x];

        if (imageValue === undefined) {
          throw new RangeError(
            "The CNN scan window extends beyond the image grid.",
          );
        }

        return weight * imageValue;
      }),
    )
    .reduce((sum, value) => sum + value, 0);

  return {
    weightedSum,
    normalizationDivisor: kernel.normalizationDivisor,
    response: weightedSum / kernel.normalizationDivisor,
  };
}

export function calculateWindowResponse(
  imageGrid: number[][],
  kernel: CalculationKernel,
  step: ScanPosition,
): number {
  return calculateWindowResult(imageGrid, kernel, step).response;
}

export function calculateFeatureMapResults(
  imageGrid: number[][],
  kernel: CalculationKernel,
  steps: ScanPosition[],
): CnnWindowResult[] {
  return steps.map((step) => calculateWindowResult(imageGrid, kernel, step));
}

export function calculateFeatureMapResponses(
  imageGrid: number[][],
  kernel: CalculationKernel,
  steps: ScanPosition[],
): number[] {
  return calculateFeatureMapResults(imageGrid, kernel, steps).map(
    ({ response }) => response,
  );
}

export function formatCnnValue(value: number): string {
  if (!Number.isFinite(value)) {
    throw new RangeError("CNN values must be finite numbers.");
  }

  return String(Number(value.toFixed(2)));
}
