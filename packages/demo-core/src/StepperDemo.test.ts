import { describe, expect, it } from "vitest";
import { getNextStepIndex, getPreviousStepIndex } from "./stepperState";

describe("stepper state", () => {
  it("keeps previous navigation at the first step", () => {
    expect(getPreviousStepIndex(0)).toBe(0);
  });

  it("keeps next navigation at the final step", () => {
    expect(getNextStepIndex(5, 6)).toBe(5);
  });

  it("moves one step inside the valid range", () => {
    expect(getNextStepIndex(1, 6)).toBe(2);
    expect(getPreviousStepIndex(3)).toBe(2);
  });
});
