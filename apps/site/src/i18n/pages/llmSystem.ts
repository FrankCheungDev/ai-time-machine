import type { Locale } from "../locales";
import type { ChapterReference } from "./demoChapters";

interface LlmSystemCardCopy {
  label: string;
  title: string;
  body: string;
}

export interface LlmSystemChapterCopy {
  title: string;
  description: string;
  eyebrow: string;
  lede: string;
  question: string;
  notesEyebrow: string;
  notesTitle: string;
  cards: LlmSystemCardCopy[];
  simplificationEyebrow: string;
  simplificationTitle: string;
  simplificationBody: string;
  referencesEyebrow: string;
  references: ChapterReference[];
}

export const llmSystemChapterCopy = {
  "zh-CN": {
    title: "LLM 与现代 AI 系统：为什么大模型还需要外部系统？",
    description:
      "解释大模型、上下文窗口、检索、工具、记忆和评估如何组成现代 AI 系统。",
    eyebrow: "Chapter 07",
    lede: "Transformer 让模型能在大规模文本中学习通用模式，但真实产品不是只有一个模型调用。现代 AI 系统会把模型放进上下文、检索、工具、记忆和评估构成的外部结构里。",
    question: "为什么大模型还需要外部知识和工具？",
    notesEyebrow: "历史位置",
    notesTitle: "它连接 Transformer、RAG 与 Agent",
    cards: [
      {
        label: "之前的问题",
        title: "模型参数不是实时世界",
        body: "预训练知识强大但会过期，也无法直接读取私有文档、业务数据库或工具结果。",
      },
      {
        label: "解决内容",
        title: "把能力放进系统结构",
        body: "上下文窗口、检索、工具调用、记忆和评估让模型变成可组合的软件组件。",
      },
      {
        label: "遗留问题",
        title: "系统仍会失败",
        body: "错误检索、工具误用、提示注入、权限泄漏和评估盲区仍需要工程约束。",
      },
    ],
    simplificationEyebrow: "简化说明",
    simplificationTitle: "这是系统地图，不是真实编排引擎",
    simplificationBody:
      "本章用两个脚本化任务说明 LLM 应用常见组件，不调用真实模型、数据库、记忆服务、工具 API 或评估服务。组件关系和结果均为教学抽象，用于解释为什么现代 AI 应用需要模型外部结构。",
    referencesEyebrow: "参考资料",
    references: [
      {
        href: "https://arxiv.org/abs/2005.14165",
        label: "Language Models are Few-Shot Learners",
      },
      {
        href: "https://arxiv.org/abs/2005.11401",
        label:
          "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
      },
      {
        href: "https://arxiv.org/abs/2210.03629",
        label: "ReAct: Synergizing Reasoning and Acting in Language Models",
      },
      {
        href: "https://doi.org/10.6028/NIST.AI.600-1",
        label: "NIST AI 600-1: Generative Artificial Intelligence Profile",
      },
    ],
  },
  en: {
    title:
      "LLMs And Modern AI Systems: Why do large models still need external systems?",
    description:
      "Explains how large models, context windows, retrieval, tools, memory, and evaluation form modern AI systems.",
    eyebrow: "Chapter 07",
    lede: "Transformers let models learn general patterns from large-scale text, but real products are more than a single model call. Modern AI systems place the model inside an external structure of context, retrieval, tools, memory, and evaluation.",
    question: "Why do large models still need external knowledge and tools?",
    notesEyebrow: "Historical position",
    notesTitle: "It connects Transformers, RAG, and agents",
    cards: [
      {
        label: "Earlier problem",
        title: "Model parameters are not the live world",
        body: "Pretrained knowledge is powerful but becomes outdated, and it cannot directly read private documents, business databases, or tool results.",
      },
      {
        label: "What it solves",
        title: "Place capability inside a system structure",
        body: "Context windows, retrieval, tool use, memory, and evaluation turn a model into a composable software component.",
      },
      {
        label: "Remaining problem",
        title: "The system can still fail",
        body: "Wrong retrieval, tool misuse, prompt injection, permission leaks, and evaluation blind spots still require engineering controls.",
      },
    ],
    simplificationEyebrow: "Simplification note",
    simplificationTitle:
      "This is a system map, not a real orchestration engine",
    simplificationBody:
      "This chapter uses two scripted tasks to explain common LLM application components. It calls no real model, database, memory service, tool API, or evaluation service. The component relationships and outcomes are teaching abstractions that explain why modern AI applications need structure outside the model.",
    referencesEyebrow: "References",
    references: [
      {
        href: "https://arxiv.org/abs/2005.14165",
        label: "Language Models are Few-Shot Learners",
      },
      {
        href: "https://arxiv.org/abs/2005.11401",
        label:
          "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
      },
      {
        href: "https://arxiv.org/abs/2210.03629",
        label: "ReAct: Synergizing Reasoning and Acting in Language Models",
      },
      {
        href: "https://doi.org/10.6028/NIST.AI.600-1",
        label: "NIST AI 600-1: Generative Artificial Intelligence Profile",
      },
    ],
  },
} satisfies Record<Locale, LlmSystemChapterCopy>;
