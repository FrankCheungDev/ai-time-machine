import { describe, expect, it } from "vitest";
import {
  calculatePosteriorPercent,
  evidenceSupportToLikelihoodRatio,
} from "./bayesMath";

describe("Bayes evidence support mapping", () => {
  it("treats the midpoint as neutral evidence", () => {
    expect(evidenceSupportToLikelihoodRatio(50)).toBe(1);
    expect(calculatePosteriorPercent(30, 50)).toBe(30);
  });

  it("moves the posterior down for opposing evidence and up for support", () => {
    expect(evidenceSupportToLikelihoodRatio(0)).toBe(0.25);
    expect(evidenceSupportToLikelihoodRatio(100)).toBe(4);
    expect(calculatePosteriorPercent(30, 0)).toBeLessThan(30);
    expect(calculatePosteriorPercent(30, 100)).toBeGreaterThan(30);
  });

  it("clamps out-of-range inputs to the teaching control bounds", () => {
    expect(calculatePosteriorPercent(1, -20)).toBe(
      calculatePosteriorPercent(5, 0),
    );
    expect(calculatePosteriorPercent(99, 140)).toBe(
      calculatePosteriorPercent(95, 100),
    );
  });
});
