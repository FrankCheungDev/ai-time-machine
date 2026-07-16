import type { ExpertSystemDemo } from "@ai-history/demo-core";
import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

const expertSystemDemos = {
  "zh-CN": {
    title: "专家系统：专家知识能否写成 if-then 规则？",
    question: "专家知识能否写成规则？为什么规则系统会脆弱？",
    simplificationNote:
      "本案例是教学示意，规则和例外都是预设；它不代表真实专家系统的完整推理引擎。",
    learningGoals: [
      "理解 if-then 规则如何把专家知识转成可解释推理。",
      "观察例外条件如何让规则之间产生冲突。",
      "说明专家系统为什么会遇到知识获取和维护成本瓶颈。",
    ],
    conditions: [
      { id: "bird", label: "对象是鸟类", defaultSelected: true },
      { id: "wings", label: "有翅膀", defaultSelected: true },
      { id: "healthy", label: "状态正常", defaultSelected: true },
    ],
    exceptionCondition: {
      id: "penguin",
      label: "加入企鹅例外",
      defaultSelected: false,
    },
    rules: [
      {
        id: "can-fly",
        ifAll: ["bird", "wings", "healthy"],
        then: "结论：它很可能会飞",
        explanation: "规则系统擅长处理边界清晰、条件稳定的问题。",
      },
      {
        id: "penguin-exception",
        ifAll: ["bird", "penguin"],
        then: "例外：企鹅是鸟，但不会飞",
        explanation: "当例外越来越多，规则之间开始互相覆盖甚至冲突。",
      },
    ],
    noMatchTitle: "没有规则命中",
    noMatchDescription:
      "当前条件不足以匹配任何规则，因此系统不会给出结论。规则库需要覆盖这种情况，或明确返回“未知”。",
    stableTitle: "规则链正常触发",
    conflictTitle: "规则冲突：会飞还是不会飞？",
    conflictDescription:
      "加入企鹅例外后，通用规则和例外规则同时触发，系统必须额外维护优先级和冲突处理。",
  },
  en: {
    title: "Expert Systems: Can expert knowledge be written as if-then rules?",
    question:
      "Can expert knowledge be written as rules, and why do rule systems become brittle?",
    simplificationNote:
      "This teaching demo uses preset rules and exceptions. It does not represent the full inference engine of a real expert system.",
    learningGoals: [
      "Understand how if-then rules turn expert knowledge into explainable reasoning.",
      "Observe how exceptions can create conflicts between rules.",
      "Explain why expert systems encounter bottlenecks in knowledge acquisition and maintenance.",
    ],
    conditions: [
      { id: "bird", label: "The object is a bird", defaultSelected: true },
      { id: "wings", label: "It has wings", defaultSelected: true },
      { id: "healthy", label: "It is healthy", defaultSelected: true },
    ],
    exceptionCondition: {
      id: "penguin",
      label: "Add the penguin exception",
      defaultSelected: false,
    },
    rules: [
      {
        id: "can-fly",
        ifAll: ["bird", "wings", "healthy"],
        then: "Conclusion: it can probably fly",
        explanation:
          "Rule systems work well for problems with clear boundaries and stable conditions.",
      },
      {
        id: "penguin-exception",
        ifAll: ["bird", "penguin"],
        then: "Exception: a penguin is a bird, but it cannot fly",
        explanation:
          "As exceptions multiply, rules begin to override or even conflict with one another.",
      },
    ],
    noMatchTitle: "No rule matches",
    noMatchDescription:
      'The current conditions do not satisfy any rule, so the system produces no conclusion. The rule base must cover this case or explicitly return "unknown."',
    stableTitle: "The rule chain fires normally",
    conflictTitle: "Rule conflict: can it fly or not?",
    conflictDescription:
      "After the penguin exception is added, the general rule and the exception fire together, so the system needs extra priority and conflict-resolution logic.",
  },
} satisfies Record<Locale, ExpertSystemDemo>;

export function getExpertSystemDemo(
  locale: Locale = defaultLocale,
): ExpertSystemDemo {
  return getLocalizedValue(expertSystemDemos, locale);
}

export const expertSystemDemo = getExpertSystemDemo();
