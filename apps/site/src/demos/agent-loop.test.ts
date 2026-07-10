import { getAgentLoopDemo } from "@ai-history/data";
import { describe, expect, it } from "vitest";
import { resolveAgentBranchNote } from "./agent-loop/agentState";

describe("resolveAgentBranchNote", () => {
  it("resolves a stable branch ID against the current localized manifest", () => {
    const selectedBranchId = "tool-failure";
    const chineseDemo = getAgentLoopDemo("zh-CN");
    const englishDemo = getAgentLoopDemo("en");

    const chineseNote = resolveAgentBranchNote(chineseDemo, selectedBranchId);
    const englishNote = resolveAgentBranchNote(englishDemo, selectedBranchId);

    expect(chineseNote).toBe(
      chineseDemo.branchOptions.find((option) => option.id === selectedBranchId)
        ?.description,
    );
    expect(englishNote).toBe(
      englishDemo.branchOptions.find((option) => option.id === selectedBranchId)
        ?.description,
    );
    expect(chineseNote).toBe(
      "工具返回空结果或过期信息，Agent 需要观察失败原因并修正计划。",
    );
    expect(englishNote).toBe(
      "The tool returns no result or outdated information, so the agent must inspect the failure and revise its plan.",
    );
  });
});
