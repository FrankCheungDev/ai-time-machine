import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import StepperDemo from "./StepperDemo.svelte";
import { getNextStepIndex, getPreviousStepIndex } from "./stepperState";
import type { DemoStep } from "./types";

const steps: DemoStep[] = [
  {
    id: "first-step",
    title: "第一步",
    description: "测试步骤",
    activeNodeIds: [],
    activeEdgeIds: []
  }
];

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

describe("StepperDemo labels", () => {
  it("renders Chinese button labels by default", () => {
    const { body } = render(StepperDemo, { props: { steps } });

    expect(body).toContain(">上一步</button>");
    expect(body).toContain(">下一步</button>");
  });

  it("renders custom button labels", () => {
    const { body } = render(StepperDemo, {
      props: {
        steps,
        previousLabel: "Previous",
        nextLabel: "Next"
      }
    });

    expect(body).toContain(">Previous</button>");
    expect(body).toContain(">Next</button>");
  });
});
