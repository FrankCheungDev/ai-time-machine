import type { ExpertRule, ExpertSystemDemo } from "@ai-history/demo-core";

export type ExpertSystemResultKind = "no-match" | "stable" | "conflict";

export interface ExpertSystemResult {
  kind: ExpertSystemResultKind;
  title: string;
  description: string;
  matchedRules: ExpertRule[];
}

export function resolveExpertSystemResult(
  demo: ExpertSystemDemo,
  selected: Record<string, boolean>,
): ExpertSystemResult {
  const matchedRules = demo.rules.filter((rule) =>
    rule.ifAll.every((conditionId) => selected[conditionId] === true),
  );

  if (matchedRules.length === 0) {
    return {
      kind: "no-match",
      title: demo.noMatchTitle,
      description: demo.noMatchDescription,
      matchedRules,
    };
  }

  if (matchedRules.length > 1) {
    return {
      kind: "conflict",
      title: demo.conflictTitle,
      description: demo.conflictDescription,
      matchedRules,
    };
  }

  const [matchedRule] = matchedRules;

  return {
    kind: "stable",
    title: demo.stableTitle,
    description: `${matchedRule.then} ${matchedRule.explanation}`,
    matchedRules,
  };
}
