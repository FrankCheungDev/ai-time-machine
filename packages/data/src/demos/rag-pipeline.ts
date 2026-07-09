import type { PipelineDemo } from "@ai-history/demo-core";
import { defaultLocale, getLocalizedValue, type Locale } from "../locales";

const edges = [
  { id: "query-embedding", from: "query", to: "embedding" },
  { id: "embedding-vector-db", from: "embedding", to: "vector-db" },
  { id: "vector-db-reranker", from: "vector-db", to: "reranker" },
  { id: "reranker-prompt", from: "reranker", to: "prompt" },
  { id: "prompt-llm", from: "prompt", to: "llm" },
  { id: "llm-answer", from: "llm", to: "answer" },
] satisfies PipelineDemo["edges"];

const ragPipelineDemos = {
  "zh-CN": {
    title: "RAG：大模型如何连接外部知识？",
    question: "为什么只靠模型参数回答问题不够？",
    simplificationNote:
      "本案例是教学示意，不调用真实向量数据库或大模型；节点高亮和文本为预设，用于解释机制直觉。",
    learningGoals: [
      "理解 Query → Embedding → Vector DB → Reranker → Prompt → LLM → Answer 的基本流程。",
      "观察检索质量如何改变答案可信度和引用价值。",
      "说清 RAG 能解决知识更新问题，也会受错误检索影响。",
    ],
    nodes: [
      { id: "query", label: "Query", description: "用户提出一个问题" },
      { id: "embedding", label: "Embedding", description: "把问题转换为向量" },
      {
        id: "vector-db",
        label: "Vector DB",
        description: "在外部知识中检索候选片段",
      },
      { id: "reranker", label: "Reranker", description: "重新排序候选片段" },
      { id: "prompt", label: "Prompt", description: "把问题和证据拼成提示" },
      { id: "llm", label: "LLM", description: "模型基于上下文生成回答" },
      { id: "answer", label: "Answer", description: "返回带依据的答案" },
    ],
    steps: [
      {
        id: "query",
        title: "用户提出一个问题",
        description:
          "问题先以自然语言进入系统。RAG 的目标不是让模型凭记忆猜，而是先找到可引用的外部证据。",
        activeNodeIds: ["query"],
        activeEdgeIds: [],
      },
      {
        id: "embedding",
        title: "把问题转换为向量",
        description:
          "系统把问题编码成向量，方便和知识库中的片段做语义相似度比较。",
        activeNodeIds: ["query", "embedding"],
        activeEdgeIds: ["query-embedding"],
      },
      {
        id: "retrieve",
        title: "从知识库检索候选片段",
        description:
          "向量数据库返回可能相关的材料。检索质量越差，后续生成越容易偏离事实。",
        activeNodeIds: ["embedding", "vector-db"],
        activeEdgeIds: ["embedding-vector-db"],
      },
      {
        id: "rerank",
        title: "重排候选证据",
        description:
          "重排器根据问题和候选片段的匹配程度筛掉噪声，把最有用的证据放到前面。",
        activeNodeIds: ["vector-db", "reranker"],
        activeEdgeIds: ["vector-db-reranker"],
      },
      {
        id: "compose",
        title: "拼接问题与证据",
        description:
          "系统把原始问题、检索证据和回答要求组合成提示，让模型知道应该依据哪些材料作答。",
        activeNodeIds: ["reranker", "prompt"],
        activeEdgeIds: ["reranker-prompt"],
      },
      {
        id: "generate",
        title: "模型基于上下文生成回答",
        description:
          "LLM 读取提示中的证据并生成答案。这里的关键是让模型少依赖模糊记忆，多依赖当前证据。",
        activeNodeIds: ["prompt", "llm"],
        activeEdgeIds: ["prompt-llm"],
      },
      {
        id: "answer",
        title: "返回可追溯答案",
        description:
          "理想情况下，最终答案不仅回答问题，还能保留引用或依据，方便用户判断可信度。",
        activeNodeIds: ["llm", "answer"],
        activeEdgeIds: ["llm-answer"],
      },
    ],
    scenarios: [
      {
        id: "no-rag",
        label: "无 RAG",
        title: "无 RAG：只能依赖参数记忆",
        description:
          "系统不检索外部材料，模型只能根据训练中留下的参数记忆回答。",
        answerPreview:
          "回答可能很流畅，但难以说明来源，也无法保证知识是最新的。",
        riskNote:
          "适合低风险常识，不适合需要最新事实、私有知识或严格引用的问题。",
      },
      {
        id: "correct",
        label: "正确检索",
        title: "正确检索：答案可引用",
        description:
          "检索片段覆盖了问题所需的关键事实，模型能把证据组织成答案。",
        answerPreview: "答案既回答问题，也能指出依据来自哪段材料。",
        riskNote:
          "RAG 的收益来自把正确证据放进上下文，而不是让模型凭空更聪明。",
      },
      {
        id: "wrong",
        label: "错误检索",
        title: "错误检索：证据把答案带偏",
        description: "错误片段会把模型带向错误答案。",
        answerPreview: "模型可能忠实总结了上下文，但上下文本身就是错的。",
        riskNote: "这就是为什么召回、重排、引用核验和人工反馈仍然重要。",
      },
      {
        id: "overloaded",
        label: "检索过多",
        title: "检索过多：上下文被噪声占满",
        description:
          "系统塞入太多弱相关片段，关键信息被稀释，模型需要在噪声中猜重点。",
        answerPreview: "答案可能变长、变含糊，甚至混合多个互相冲突的来源。",
        riskNote: "更多上下文不总是更好，chunk、top-k 和重排策略会影响结果。",
      },
    ],
  },
  en: {
    title: "RAG: How do large language models connect to external knowledge?",
    question:
      "Why are model parameters alone not enough for answering questions?",
    simplificationNote:
      "This teaching demo does not call a real vector database or large language model. Highlighted nodes and text are scripted to explain the mechanism.",
    learningGoals: [
      "Understand the basic Query → Embedding → Vector DB → Reranker → Prompt → LLM → Answer flow.",
      "See how retrieval quality changes answer trustworthiness and citation value.",
      "Explain how RAG helps with knowledge freshness while still depending on retrieval quality.",
    ],
    nodes: [
      { id: "query", label: "Query", description: "A user asks a question" },
      {
        id: "embedding",
        label: "Embedding",
        description: "Convert the question into a vector",
      },
      {
        id: "vector-db",
        label: "Vector DB",
        description: "Retrieve candidate passages from external knowledge",
      },
      {
        id: "reranker",
        label: "Reranker",
        description: "Reorder candidate passages",
      },
      {
        id: "prompt",
        label: "Prompt",
        description: "Combine the question and evidence into a prompt",
      },
      {
        id: "llm",
        label: "LLM",
        description: "Generate an answer from the provided context",
      },
      {
        id: "answer",
        label: "Answer",
        description: "Return an answer grounded in evidence",
      },
    ],
    steps: [
      {
        id: "query",
        title: "A user asks a question",
        description:
          "The question enters the system in natural language. RAG aims to find citeable external evidence before the model answers from memory.",
        activeNodeIds: ["query"],
        activeEdgeIds: [],
      },
      {
        id: "embedding",
        title: "Convert the question into a vector",
        description:
          "The system encodes the question as a vector so it can compare semantic similarity with passages in the knowledge base.",
        activeNodeIds: ["query", "embedding"],
        activeEdgeIds: ["query-embedding"],
      },
      {
        id: "retrieve",
        title: "Retrieve candidate passages from the knowledge base",
        description:
          "The vector database returns potentially relevant material. Poor retrieval quality makes later generation more likely to drift from the facts.",
        activeNodeIds: ["embedding", "vector-db"],
        activeEdgeIds: ["embedding-vector-db"],
      },
      {
        id: "rerank",
        title: "Rerank the candidate evidence",
        description:
          "The reranker filters noise by measuring how well each candidate passage matches the question, placing the most useful evidence first.",
        activeNodeIds: ["vector-db", "reranker"],
        activeEdgeIds: ["vector-db-reranker"],
      },
      {
        id: "compose",
        title: "Combine the question and evidence",
        description:
          "The system combines the original question, retrieved evidence, and answer instructions into a prompt that tells the model which material to use.",
        activeNodeIds: ["reranker", "prompt"],
        activeEdgeIds: ["reranker-prompt"],
      },
      {
        id: "generate",
        title: "Generate an answer from the context",
        description:
          "The LLM reads the evidence in the prompt and generates an answer. The key is to rely less on uncertain memory and more on current evidence.",
        activeNodeIds: ["prompt", "llm"],
        activeEdgeIds: ["prompt-llm"],
      },
      {
        id: "answer",
        title: "Return a traceable answer",
        description:
          "Ideally, the final answer responds to the question while preserving citations or supporting evidence so users can judge its credibility.",
        activeNodeIds: ["llm", "answer"],
        activeEdgeIds: ["llm-answer"],
      },
    ],
    scenarios: [
      {
        id: "no-rag",
        label: "No RAG",
        title: "No RAG: relying only on parameter memory",
        description:
          "The system does not retrieve external material, so the model can only answer from patterns stored during training.",
        answerPreview:
          "The answer may sound fluent, but it cannot show sources or guarantee that the knowledge is current.",
        riskNote:
          "This is acceptable for low-risk common knowledge, not for current facts, private knowledge, or strict citation needs.",
      },
      {
        id: "correct",
        label: "Correct retrieval",
        title: "Correct retrieval: an answer with citations",
        description:
          "The retrieved passages cover the key facts needed by the question, allowing the model to organize the evidence into an answer.",
        answerPreview:
          "The answer addresses the question and identifies which source material supports it.",
        riskNote:
          "RAG works by placing the right evidence in context, not by making the model inherently smarter.",
      },
      {
        id: "wrong",
        label: "Wrong retrieval",
        title: "Wrong retrieval: evidence leads the answer astray",
        description:
          "Incorrect passages steer the model toward an incorrect answer.",
        answerPreview:
          "The model may summarize the context faithfully even though the context itself is wrong.",
        riskNote:
          "That is why recall, reranking, citation verification, and human feedback still matter.",
      },
      {
        id: "overloaded",
        label: "Too much retrieval",
        title: "Too much retrieval: noise fills the context",
        description:
          "The system inserts too many weakly related passages, diluting key information and forcing the model to find the signal in the noise.",
        answerPreview:
          "The answer may grow longer and less precise, or combine several conflicting sources.",
        riskNote:
          "More context is not always better. Chunking, top-k, and reranking strategies all affect the result.",
      },
    ],
  },
} satisfies Record<Locale, Omit<PipelineDemo, "edges">>;

export function getRagPipelineDemo(
  locale: Locale = defaultLocale,
): PipelineDemo {
  return {
    ...getLocalizedValue(ragPipelineDemos, locale),
    edges,
  };
}

export const ragPipelineDemo = getRagPipelineDemo();
