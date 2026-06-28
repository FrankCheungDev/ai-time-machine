import type { BayesUpdateDemo } from "@ai-history/demo-core";

export const bayesUpdateDemo = {
  title: "概率推理：机器如何处理不确定性？",
  question: "证据如何改变信念？",
  simplificationNote:
    "本案例用简化的 odds 更新公式展示方向感，不代表完整医学、法律或科学推断流程。",
  priorDefault: 30,
  evidenceDefault: 55,
  priorLabel: "先验信念",
  evidenceLabel: "证据强度",
  insight: "统计推理不是把世界写成绝对规则，而是在新证据出现时更新不确定性。"
} satisfies BayesUpdateDemo;
