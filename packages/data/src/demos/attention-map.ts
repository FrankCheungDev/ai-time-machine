import type { AttentionMapDemo } from "@ai-history/demo-core";
import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

const links: AttentionMapDemo["links"] = [
  { id: "model-knowledge", from: "model", to: "knowledge", weight: 0.94 },
  { id: "model-retrieve", from: "model", to: "retrieve", weight: 0.72 },
  { id: "needs-knowledge", from: "needs", to: "knowledge", weight: 0.68 },
  {
    id: "knowledge-retrieve",
    from: "knowledge",
    to: "retrieve",
    weight: 0.86,
  },
  { id: "when-then", from: "when", to: "then", weight: 0.54 },
];

const attentionMapDemos = {
  "zh-CN": {
    title: "Attention 与 Transformer：token 为什么可以直接互相关注？",
    question: "为什么 Attention 比 RNN 更适合建模长距离依赖？",
    simplificationNote:
      "本案例中的 attention 权重为教学预设，不来自真实 Transformer 模型；它只用来说明直接连接带来的机制直觉。",
    learningGoals: [
      "理解 Attention 让 token 之间建立直接连接，而不是只能顺序传递。",
      "观察远距离 token 关系为什么在 RNN 模式下更容易变弱。",
      "把 Attention 与 Transformer、基础模型的历史位置联系起来。",
    ],
    attentionModeCopy:
      "Attention 让每个 token 可以直接查看相关 token，远距离关系不必一格一格传递。",
    rnnModeCopy: "链式传递会让远距离关系逐步变弱。",
    tokens: [
      {
        id: "when",
        label: "当",
        x: 72,
        y: 212,
        focusTitle: "“当”建立条件语境",
        focusDescription: "它提醒后面的 token：这句话在描述一个条件场景。",
      },
      {
        id: "model",
        label: "模型",
        x: 188,
        y: 120,
        focusTitle: "“模型”直接关注“外部知识”",
        focusDescription:
          "在 Attention 中，“模型”可以跨过中间词，直接连接到真正补足语义的“外部知识”。",
      },
      {
        id: "needs",
        label: "需要",
        x: 316,
        y: 212,
        focusTitle: "“需要”连接行动动机",
        focusDescription:
          "它把主体和目标连起来，说明为什么后面的检索动作会出现。",
      },
      {
        id: "knowledge",
        label: "外部知识",
        x: 464,
        y: 120,
        focusTitle: "“外部知识”是远距离关键点",
        focusDescription:
          "这个 token 离“模型”不近，但它对句子意义最关键；Attention 可以直接把它拉近。",
      },
      {
        id: "then",
        label: "时",
        x: 608,
        y: 212,
        focusTitle: "“时”收束条件",
        focusDescription: "它帮助模型理解前半句是条件，而不是最终动作。",
      },
      {
        id: "retrieve",
        label: "检索",
        x: 742,
        y: 120,
        focusTitle: "“检索”指向解决方式",
        focusDescription:
          "它与“外部知识”形成强关系，解释 RAG 为什么会接在大模型之后。",
      },
    ],
  },
  en: {
    title:
      "Attention And Transformers: Why can tokens directly attend to each other?",
    question:
      "Why is Attention better suited than an RNN for modeling long-range dependencies?",
    simplificationNote:
      "The attention weights in this demo are preset for teaching and do not come from a real Transformer model. They only illustrate the intuition behind direct connections.",
    learningGoals: [
      "Understand how Attention creates direct connections between tokens instead of passing information only in sequence.",
      "Observe why relationships between distant tokens weaken more easily in RNN mode.",
      "Connect Attention to the historical role of Transformers and foundation models.",
    ],
    attentionModeCopy:
      "Attention lets each token inspect related tokens directly, so long-range relationships do not need to pass through every intermediate position.",
    rnnModeCopy:
      "Chain-like transmission gradually weakens relationships over long distances.",
    tokens: [
      {
        id: "when",
        label: "When",
        x: 72,
        y: 212,
        focusTitle: '"When" establishes a condition',
        focusDescription:
          "It signals to later tokens that the sentence is describing a conditional situation.",
      },
      {
        id: "model",
        label: "a model",
        x: 188,
        y: 120,
        focusTitle: '"a model" directly attends to "external knowledge"',
        focusDescription:
          'With Attention, "a model" can skip intermediate words and connect directly to "external knowledge," which completes the meaning.',
      },
      {
        id: "needs",
        label: "needs",
        x: 316,
        y: 212,
        focusTitle: '"needs" connects the subject to its motivation',
        focusDescription:
          "It links the subject and target, explaining why a retrieval action appears later.",
      },
      {
        id: "knowledge",
        label: "external knowledge",
        x: 464,
        y: 120,
        focusTitle: '"external knowledge" is the distant key',
        focusDescription:
          'This token is not close to "a model," but it is crucial to the sentence meaning. Attention can bring it directly into focus.',
      },
      {
        id: "then",
        label: "it",
        x: 608,
        y: 212,
        focusTitle: '"it" closes the conditional phrase',
        focusDescription:
          "It helps the model understand that the first part is a condition rather than the final action.",
      },
      {
        id: "retrieve",
        label: "retrieves",
        x: 742,
        y: 120,
        focusTitle: '"retrieves" points to the solution',
        focusDescription:
          'Its strong relationship with "external knowledge" explains why RAG is connected to large language models.',
      },
    ],
  },
} satisfies Record<Locale, Omit<AttentionMapDemo, "links">>;

export function getAttentionMapDemo(
  locale: Locale = defaultLocale,
): AttentionMapDemo {
  return {
    ...getLocalizedValue(attentionMapDemos, locale),
    links,
  };
}

export const attentionMapDemo = getAttentionMapDemo();
