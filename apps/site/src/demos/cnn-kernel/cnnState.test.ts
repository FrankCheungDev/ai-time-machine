import { getCnnKernelDemo } from "@ai-history/data";
import { describe, expect, it } from "vitest";
import {
  calculateFeatureMapResponses,
  calculateFeatureMapResults,
  calculateWindowResponse,
  calculateWindowResult,
  formatCnnValue,
} from "./cnnState";

const demo = getCnnKernelDemo("zh-CN");

function getKernel(kernelId: string) {
  const kernel = demo.kernels.find(({ id }) => id === kernelId);

  if (!kernel) {
    throw new Error(`Missing CNN kernel: ${kernelId}`);
  }

  return kernel;
}

describe("CNN feature-map calculations", () => {
  it("scans all nine valid positions with the edge kernel", () => {
    const results = calculateFeatureMapResults(
      demo.imageGrid,
      getKernel("edge"),
      demo.scanSteps,
    );

    expect(results).toHaveLength(9);
    expect(results.map(({ weightedSum }) => weightedSum)).toEqual([
      3, 3, 0, 3, 3, 0, 3, 3, 0,
    ]);
    expect(results.map(({ response }) => response)).toEqual([
      3, 3, 0, 3, 3, 0, 3, 3, 0,
    ]);
  });

  it("normalizes the smoothing kernel into the complete 3 by 3 map", () => {
    const kernel = getKernel("blur");
    const results = calculateFeatureMapResults(
      demo.imageGrid,
      kernel,
      demo.scanSteps,
    );

    expect(results.map(({ weightedSum }) => weightedSum)).toEqual([
      3, 6, 9, 3, 6, 9, 3, 6, 9,
    ]);
    expect(results.map(({ response }) => formatCnnValue(response))).toEqual([
      "0.33",
      "0.67",
      "1",
      "0.33",
      "0.67",
      "1",
      "0.33",
      "0.67",
      "1",
    ]);
    expect(
      calculateFeatureMapResponses(demo.imageGrid, kernel, demo.scanSteps)[1],
    ).toBeCloseTo(2 / 3);
  });

  it("returns both the weighted sum and normalized response", () => {
    const kernel = getKernel("blur");
    const result = calculateWindowResult(
      demo.imageGrid,
      kernel,
      demo.scanSteps[1]!,
    );

    expect(result).toEqual({
      weightedSum: 6,
      normalizationDivisor: 9,
      response: 2 / 3,
    });
    expect(
      calculateWindowResponse(demo.imageGrid, kernel, demo.scanSteps[1]!),
    ).toBeCloseTo(2 / 3);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects the invalid normalization divisor %s",
    (normalizationDivisor) => {
      expect(() =>
        calculateWindowResult(
          demo.imageGrid,
          { ...getKernel("blur"), normalizationDivisor },
          demo.scanSteps[0]!,
        ),
      ).toThrow(RangeError);
    },
  );

  it.each([
    { x: -1, y: 0 },
    { x: 0, y: -1 },
    { x: 3, y: 0 },
    { x: 0, y: 3 },
    { x: 0.5, y: 0 },
  ])("rejects an invalid or out-of-bounds window at $x,$y", (step) => {
    expect(() =>
      calculateWindowResult(demo.imageGrid, getKernel("edge"), step),
    ).toThrow(RangeError);
  });

  it("formats finite values with at most two decimal places", () => {
    expect(formatCnnValue(1 / 3)).toBe("0.33");
    expect(formatCnnValue(2 / 3)).toBe("0.67");
    expect(formatCnnValue(1)).toBe("1");
    expect(formatCnnValue(1.2)).toBe("1.2");
    expect(() => formatCnnValue(Number.NaN)).toThrow(RangeError);
  });
});
