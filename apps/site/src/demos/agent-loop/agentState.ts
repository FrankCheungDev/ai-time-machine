import type { AgentLoopDemo } from "@ai-history/demo-core";

export function resolveAgentBranchNote(
  demo: Pick<AgentLoopDemo, "branchOptions">,
  selectedBranchId: string,
): string {
  return (
    demo.branchOptions.find((option) => option.id === selectedBranchId)
      ?.description ?? ""
  );
}
