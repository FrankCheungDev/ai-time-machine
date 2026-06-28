import type { PipelineDemo } from "@ai-history/demo-core";

export const ragPipelineDemo = {
  title: "RAG：大模型如何连接外部知识？",
  question: "为什么只靠模型参数回答问题不够？",
  simplificationNote:
    "本案例是教学示意，不调用真实向量数据库或大模型；节点高亮和文本为预设，用于解释机制直觉。",
  nodes: [
    { id: "query", label: "Query", description: "用户提出一个问题" },
    { id: "embedding", label: "Embedding", description: "把问题转换为向量" },
    { id: "vector-db", label: "Vector DB", description: "在外部知识中检索候选片段" },
    { id: "reranker", label: "Reranker", description: "重新排序候选片段" },
    { id: "prompt", label: "Prompt", description: "把问题和证据拼成提示" },
    { id: "llm", label: "LLM", description: "模型基于上下文生成回答" },
    { id: "answer", label: "Answer", description: "返回带依据的答案" }
  ],
  edges: [
    { id: "query-embedding", from: "query", to: "embedding" },
    { id: "embedding-vector-db", from: "embedding", to: "vector-db" },
    { id: "vector-db-reranker", from: "vector-db", to: "reranker" },
    { id: "reranker-prompt", from: "reranker", to: "prompt" },
    { id: "prompt-llm", from: "prompt", to: "llm" },
    { id: "llm-answer", from: "llm", to: "answer" }
  ],
  steps: [
    {
      id: "query",
      title: "用户提出一个问题",
      description: "问题先以自然语言进入系统。RAG 的目标不是让模型凭记忆猜，而是先找到可引用的外部证据。",
      activeNodeIds: ["query"],
      activeEdgeIds: []
    },
    {
      id: "embedding",
      title: "把问题转换为向量",
      description: "系统把问题编码成向量，方便和知识库中的片段做语义相似度比较。",
      activeNodeIds: ["query", "embedding"],
      activeEdgeIds: ["query-embedding"]
    },
    {
      id: "retrieve",
      title: "从知识库检索候选片段",
      description: "向量数据库返回可能相关的材料。检索质量越差，后续生成越容易偏离事实。",
      activeNodeIds: ["embedding", "vector-db"],
      activeEdgeIds: ["embedding-vector-db"]
    },
    {
      id: "rerank",
      title: "重排候选证据",
      description: "重排器根据问题和候选片段的匹配程度筛掉噪声，把最有用的证据放到前面。",
      activeNodeIds: ["vector-db", "reranker"],
      activeEdgeIds: ["vector-db-reranker"]
    },
    {
      id: "compose",
      title: "拼接问题与证据",
      description: "系统把原始问题、检索证据和回答要求组合成提示，让模型知道应该依据哪些材料作答。",
      activeNodeIds: ["reranker", "prompt"],
      activeEdgeIds: ["reranker-prompt"]
    },
    {
      id: "generate",
      title: "模型基于上下文生成回答",
      description: "LLM 读取提示中的证据并生成答案。这里的关键是让模型少依赖模糊记忆，多依赖当前证据。",
      activeNodeIds: ["prompt", "llm"],
      activeEdgeIds: ["prompt-llm"]
    },
    {
      id: "answer",
      title: "返回可追溯答案",
      description: "理想情况下，最终答案不仅回答问题，还能保留引用或依据，方便用户判断可信度。",
      activeNodeIds: ["llm", "answer"],
      activeEdgeIds: ["llm-answer"]
    }
  ]
} satisfies PipelineDemo;
