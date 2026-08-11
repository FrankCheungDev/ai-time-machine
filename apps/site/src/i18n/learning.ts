import {
  getChapterDefinition,
  type ChapterId,
  type ChapterKind,
  type DemoChapterId,
} from "@ai-history/data/chapters";
import { toLocalizedPath, type Locale } from "./locales";

const activityTitles = {
  "zh-CN": {
    search: "搜索树逐步探索",
    "expert-system": "专家系统推理演示",
    bayes: "贝叶斯更新实验",
    "decision-boundary": "决策边界探索",
    cnn: "CNN 卷积核实验",
    "reinforcement-learning": "反馈学习闭环实验",
    attention: "注意力热图探索",
    "foundation-model": "基础模型生命周期实验",
    "llm-system": "LLM 系统边界实验",
    rag: "RAG 流程演示",
    agent: "Agent 循环演示",
    safety: "Safety / Eval 发布门实验",
  },
  en: {
    search: "Search Tree Walkthrough",
    "expert-system": "Expert System Inference",
    bayes: "Bayesian Update Lab",
    "decision-boundary": "Decision Boundary Explorer",
    cnn: "CNN Kernel Explorer",
    "reinforcement-learning": "Feedback Learning Loop Lab",
    attention: "Attention Map Explorer",
    "foundation-model": "Foundation Model Lifecycle Lab",
    "llm-system": "LLM System Boundary Lab",
    rag: "RAG Pipeline Walkthrough",
    agent: "Agent Loop Walkthrough",
    safety: "Safety / Eval Release Gate Lab",
  },
} satisfies Record<Locale, Record<DemoChapterId, string>>;

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
  chapterContextNavigation: string;
  viewChapterTimeline: string;
  viewChapterLineage: string;
  reviewEyebrow: string;
  reviewHeading: string;
  reviewCount: (count: number) => string;
  reviewIntro: string;
  reviewBoundary: string;
  reviewEmpty: string;
  reviewCleared: string;
  reviewChapterNumber: (number: string) => string;
  reviewAction: string;
  reviewMore: (count: number) => string;
  clearReviewRecords: string;
  clearReviewConfirmation: string;
  confirmClearReview: string;
  cancelClearReview: string;
  reviewStorageWarning: string;
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
    chapterContextNavigation: "本章的历史与技术谱系",
    viewChapterTimeline: "在时间线中查看本章",
    viewChapterLineage: "在技术谱系中查看本章",
    reviewEyebrow: "Local Review",
    reviewHeading: "本机复习建议",
    reviewCount: (count) => `待复习 ${count} 章`,
    reviewIntro:
      "建议只根据这台设备上的概念自测记录生成，并按学习主线排列；再次答对后会移出。",
    reviewBoundary: "它不是能力评估，也不代表学习效果已经得到验证。",
    reviewEmpty: "当前没有待处理的复习建议。",
    reviewCleared: "本机自测与复习记录已清除，章节完成进度未改变。",
    reviewChapterNumber: (number) => `第 ${number} 章`,
    reviewAction: "前往自测",
    reviewMore: (count) => `查看其余 ${count} 章`,
    clearReviewRecords: "清除自测与复习记录",
    clearReviewConfirmation:
      "确定删除这台设备上的全部自测与复习记录？章节完成进度会保留。",
    confirmClearReview: "确定清除",
    cancelClearReview: "取消",
    reviewStorageWarning:
      "无法读取或更新这台设备上的自测记录；章节与自测仍可正常使用。",
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
    chapterContextNavigation: "Chapter history and technology lineage",
    viewChapterTimeline: "View this chapter in the timeline",
    viewChapterLineage: "View this chapter in the technology lineage",
    reviewEyebrow: "Local Review",
    reviewHeading: "Review Suggestions On This Device",
    reviewCount: (count) =>
      `${count} ${count === 1 ? "chapter" : "chapters"} suggested for review`,
    reviewIntro:
      "Suggestions use only concept-check records on this device and follow learning-path order. A correct answer removes a suggestion.",
    reviewBoundary:
      "They are not an ability assessment or evidence of validated learning outcomes.",
    reviewEmpty: "There are no review suggestions to address right now.",
    reviewCleared:
      "Self-check and review records were cleared. Chapter completion did not change.",
    reviewChapterNumber: (number) => `Chapter ${number}`,
    reviewAction: "Open self-check",
    reviewMore: (count) =>
      `Show ${count} more ${count === 1 ? "chapter" : "chapters"}`,
    clearReviewRecords: "Clear self-check and review records",
    clearReviewConfirmation:
      "Delete every self-check and review record on this device? Chapter completion will remain.",
    confirmClearReview: "Clear records",
    cancelClearReview: "Cancel",
    reviewStorageWarning:
      "Self-check records on this device cannot be read or updated. Chapters and checks remain available.",
  },
} satisfies Record<Locale, LearningUiCopy>;

export interface LocalizedChapterContextLink {
  kind: "timeline" | "lineage";
  href: string;
  label: string;
}

export function getLocalizedChapterContextLinks(
  id: ChapterId,
  locale: Locale,
): LocalizedChapterContextLink[] {
  const chapter = getChapterDefinition(id);
  const copy = learningUiCopy[locale];
  const links: LocalizedChapterContextLink[] = [];

  if ("timelineId" in chapter && chapter.timelineId) {
    links.push({
      kind: "timeline",
      href: `${toLocalizedPath("/timeline/", locale)}?chapter=${encodeURIComponent(chapter.id)}#timeline-milestones`,
      label: copy.viewChapterTimeline,
    });
  }

  if ("lineageNodeId" in chapter && chapter.lineageNodeId) {
    const lineageNodeId = encodeURIComponent(chapter.lineageNodeId);
    links.push({
      kind: "lineage",
      href: `${toLocalizedPath("/lineage/", locale)}?lineage=${lineageNodeId}#node-${lineageNodeId}`,
      label: copy.viewChapterLineage,
    });
  }

  return links;
}

export interface LocalizedLearningChapter {
  id: ChapterId;
  kind: ChapterKind;
  number: string;
  label: string;
  title: string;
  href: string;
  activityTitle?: string;
}

export function getLocalizedLearningChapter(
  id: ChapterId,
  locale: Locale,
): LocalizedLearningChapter {
  const chapter = getChapterDefinition(id);
  const activityTitle =
    chapter.kind === "demo" ? activityTitles[locale][chapter.id] : undefined;

  return {
    id: chapter.id,
    kind: chapter.kind,
    number: chapter.number,
    label: `${chapter.kind === "demo" ? "Demo" : "Chapter"} ${chapter.number}`,
    title: chapter.shortTitle[locale],
    href: toLocalizedPath(chapter.route, locale),
    ...(activityTitle ? { activityTitle } : {}),
  };
}

export function getLocalizedConceptCheckHref(
  id: ChapterId,
  locale: Locale,
): string {
  const chapter = getLocalizedLearningChapter(id, locale);
  return `${chapter.href}#concept-check-${chapter.id}`;
}
