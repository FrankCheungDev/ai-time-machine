import {
  getLearningPathContext,
  type LearningChapterId,
  type LearningChapterKind,
} from "../learning/learningPath";
import { toLocalizedPath, type Locale } from "./locales";

type DemoLearningChapterId = Exclude<
  LearningChapterId,
  "overview" | "llm-system"
>;

const chapterTitles = {
  "zh-CN": {
    overview: "总览",
    search: "搜索树 / A*",
    "expert-system": "专家系统规则推理",
    bayes: "贝叶斯更新",
    "decision-boundary": "决策边界",
    cnn: "CNN 卷积核",
    attention: "注意力机制",
    "llm-system": "LLM 系统地图",
    rag: "RAG Pipeline",
    agent: "Agent Loop",
  },
  en: {
    overview: "Overview",
    search: "Search Trees / A*",
    "expert-system": "Expert System Rule Reasoning",
    bayes: "Bayesian Updating",
    "decision-boundary": "Decision Boundaries",
    cnn: "CNN Kernels",
    attention: "Attention",
    "llm-system": "LLM System Map",
    rag: "RAG Pipeline",
    agent: "Agent Loop",
  },
} satisfies Record<Locale, Record<LearningChapterId, string>>;

const activityTitles = {
  "zh-CN": {
    search: "搜索树逐步探索",
    "expert-system": "专家系统推理演示",
    bayes: "贝叶斯更新实验",
    "decision-boundary": "决策边界探索",
    cnn: "CNN 卷积核实验",
    attention: "注意力热图探索",
    rag: "RAG 流程演示",
    agent: "Agent 循环演示",
  },
  en: {
    search: "Search Tree Walkthrough",
    "expert-system": "Expert System Inference",
    bayes: "Bayesian Update Lab",
    "decision-boundary": "Decision Boundary Explorer",
    cnn: "CNN Kernel Explorer",
    attention: "Attention Map Explorer",
    rag: "RAG Pipeline Walkthrough",
    agent: "Agent Loop Walkthrough",
  },
} satisfies Record<Locale, Record<DemoLearningChapterId, string>>;

export interface LearningUiCopy {
  positionLabel: (position: number, total: number) => string;
  positionAriaLabel: (position: number, total: number) => string;
  startLearning: string;
  completedCount: (completed: number, total: number) => string;
  continueLearning: (title: string) => string;
  currentChapterComplete: string;
  completeAndContinue: string;
  previousChapter: (title: string) => string;
  nextChapter: (title: string) => string;
  continueFirstIncomplete: (title: string) => string;
  pathComplete: string;
  resetProgress: string;
  resetConfirmation: string;
  confirmReset: string;
  cancelReset: string;
  storageWarning: string;
  continueWithoutSaving: string;
  reviewTimeline: string;
  reviewLineage: string;
  reviewDiagrams: string;
  browseAllChapters: string;
}

export const learningUiCopy = {
  "zh-CN": {
    positionLabel: (position, total) =>
      `学习主线 · 第 ${position} / ${total} 章`,
    positionAriaLabel: (position, total) =>
      `当前位于第 ${position} 章，共 ${total} 章`,
    startLearning: "从总览开始",
    completedCount: (completed, total) => `已完成 ${completed} / ${total}`,
    continueLearning: (title) => `继续学习：${title}`,
    currentChapterComplete: "本章已完成",
    completeAndContinue: "标记完成并继续",
    previousChapter: (title) => `上一章：${title}`,
    nextChapter: (title) => `下一章：${title}`,
    continueFirstIncomplete: (title) => `继续未完成章节：${title}`,
    pathComplete: "学习主线已完成",
    resetProgress: "重置学习进度",
    resetConfirmation: "确定重置？",
    confirmReset: "确定重置",
    cancelReset: "取消",
    storageWarning: "本设备无法保存学习进度，章节仍可正常阅读。",
    continueWithoutSaving: "继续下一章（不保存进度）",
    reviewTimeline: "回顾时间线",
    reviewLineage: "回顾谱系图",
    reviewDiagrams: "回顾图源",
    browseAllChapters: "浏览全部章节",
  },
  en: {
    positionLabel: (position, total) =>
      `Learning path · Chapter ${position} / ${total}`,
    positionAriaLabel: (position, total) =>
      `Currently at chapter ${position} of ${total}`,
    startLearning: "Start with the overview",
    completedCount: (completed, total) => `Completed ${completed} / ${total}`,
    continueLearning: (title) => `Continue: ${title}`,
    currentChapterComplete: "Chapter complete",
    completeAndContinue: "Mark complete and continue",
    previousChapter: (title) => `Previous: ${title}`,
    nextChapter: (title) => `Next: ${title}`,
    continueFirstIncomplete: (title) => `Continue incomplete chapter: ${title}`,
    pathComplete: "Learning path complete",
    resetProgress: "Reset learning progress",
    resetConfirmation: "Reset progress?",
    confirmReset: "Reset",
    cancelReset: "Cancel",
    storageWarning:
      "Learning progress cannot be saved on this device. Chapters remain available to read.",
    continueWithoutSaving:
      "Continue to the next chapter (progress will not be saved)",
    reviewTimeline: "Review the timeline",
    reviewLineage: "Review the lineage",
    reviewDiagrams: "Review diagram sources",
    browseAllChapters: "Browse all chapters",
  },
} satisfies Record<Locale, LearningUiCopy>;

export interface LocalizedLearningChapter {
  id: LearningChapterId;
  kind: LearningChapterKind;
  title: string;
  href: string;
  activityTitle?: string;
}

export function getLocalizedLearningChapter(
  id: LearningChapterId,
  locale: Locale,
): LocalizedLearningChapter {
  const chapter = getLearningPathContext(id).current;
  const activityTitle =
    chapter.kind === "demo"
      ? activityTitles[locale][id as DemoLearningChapterId]
      : undefined;

  return {
    id: chapter.id,
    kind: chapter.kind,
    title: chapterTitles[locale][chapter.id],
    href: toLocalizedPath(chapter.route, locale),
    ...(activityTitle ? { activityTitle } : {}),
  };
}
