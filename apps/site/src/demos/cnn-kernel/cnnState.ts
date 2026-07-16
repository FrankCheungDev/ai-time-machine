import type { CnnScanStep } from "@ai-history/demo-core";

type ScanPosition = Pick<CnnScanStep, "x" | "y">;

export function calculateWindowResponse(
  imageGrid: number[][],
  kernel: number[][],
  step: ScanPosition,
): number {
  return kernel
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
}

export function calculateFeatureMapResponses(
  imageGrid: number[][],
  kernel: number[][],
  steps: ScanPosition[],
): number[] {
  return steps.map((step) => calculateWindowResponse(imageGrid, kernel, step));
}
