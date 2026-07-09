import type { BayesUpdateDemo } from "@ai-history/demo-core";
import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

const bayesUpdateDemos = {
  "zh-CN": {
    title: "概率推理：机器如何处理不确定性？",
    question: "证据如何改变信念？",
    simplificationNote:
      "本案例用简化的 odds 更新公式展示方向感，不代表完整医学、法律或科学推断流程。",
    learningGoals: [
      "理解先验信念会在新证据出现后被更新，而不是被直接替代。",
      "观察证据强度如何推动后验概率变化。",
      "区分概率推理和确定性规则推理的表达方式。",
    ],
    priorDefault: 30,
    evidenceDefault: 55,
    priorLabel: "先验信念",
    evidenceLabel: "证据强度",
    insight: "统计推理不是把世界写成绝对规则，而是在新证据出现时更新不确定性。",
  },
  en: {
    title: "Probabilistic Reasoning: How do machines handle uncertainty?",
    question: "How does evidence change a belief?",
    simplificationNote:
      "This demo uses a simplified odds update to show the direction of change. It does not represent a complete medical, legal, or scientific inference process.",
    learningGoals: [
      "Understand that new evidence updates a prior belief rather than replacing it outright.",
      "Observe how evidence strength changes the posterior probability.",
      "Distinguish probabilistic reasoning from deterministic rule-based reasoning.",
    ],
    priorDefault: 30,
    evidenceDefault: 55,
    priorLabel: "Prior belief",
    evidenceLabel: "Evidence strength",
    insight:
      "Statistical reasoning does not express the world as absolute rules; it updates uncertainty as new evidence arrives.",
  },
} satisfies Record<Locale, BayesUpdateDemo>;

export function getBayesUpdateDemo(
  locale: Locale = defaultLocale,
): BayesUpdateDemo {
  return getLocalizedValue(bayesUpdateDemos, locale);
}

export const bayesUpdateDemo = getBayesUpdateDemo();
