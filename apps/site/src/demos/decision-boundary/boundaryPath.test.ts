import { describe, expect, it } from "vitest";
import { getBoundaryPath } from "./boundaryPath";

describe("decision boundary teaching paths", () => {
  it.each(["linear", "nonlinear", "overfit"])(
    "changes the %s boundary when the outlier moves",
    (modeId) => {
      expect(getBoundaryPath(modeId, 78)).not.toBe(
        getBoundaryPath(modeId, 260),
      );
    },
  );

  it("clamps the outlier to the visible teaching range", () => {
    expect(getBoundaryPath("linear", -100)).toBe(getBoundaryPath("linear", 78));
    expect(getBoundaryPath("overfit", 999)).toBe(
      getBoundaryPath("overfit", 260),
    );
  });

  it("makes the overfit path explicitly bend near the outlier", () => {
    expect(getBoundaryPath("overfit", 200)).toContain("470 180");
  });
});
