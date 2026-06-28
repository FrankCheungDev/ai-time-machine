import type { ExpertSystemDemo } from "@ai-history/demo-core";

export const expertSystemDemo = {
  title: "专家系统：专家知识能否写成 if-then 规则？",
  question: "专家知识能否写成规则？为什么规则系统会脆弱？",
  simplificationNote:
    "本案例是教学示意，规则和例外都是预设；它不代表真实专家系统的完整推理引擎。",
  conditions: [
    { id: "bird", label: "对象是鸟类", defaultSelected: true },
    { id: "wings", label: "有翅膀", defaultSelected: true },
    { id: "healthy", label: "状态正常", defaultSelected: true }
  ],
  exceptionCondition: { id: "penguin", label: "加入企鹅例外", defaultSelected: false },
  rules: [
    {
      id: "can-fly",
      ifAll: ["bird", "wings", "healthy"],
      then: "结论：它很可能会飞",
      explanation: "规则系统擅长处理边界清晰、条件稳定的问题。"
    },
    {
      id: "penguin-exception",
      ifAll: ["bird", "penguin"],
      then: "例外：企鹅是鸟，但不会飞",
      explanation: "当例外越来越多，规则之间开始互相覆盖甚至冲突。"
    }
  ],
  stableTitle: "规则链正常触发",
  stableDescription: "当前条件匹配一条清晰规则：鸟类、有翅膀、状态正常，因此系统给出会飞的结论。",
  conflictTitle: "规则冲突：会飞还是不会飞？",
  conflictDescription: "加入企鹅例外后，通用规则和例外规则同时触发，系统必须额外维护优先级和冲突处理。"
} satisfies ExpertSystemDemo;
