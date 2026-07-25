import type { Locale } from "./locales";

export interface ConceptCheckUiCopy {
  eyebrow: string;
  heading: string;
  nonBlockingNote: string;
  submit: string;
  correctHeading: string;
  incorrectHeading: string;
  correctSummary: string;
  incorrectSummary: string;
  showExplanation: string;
  hideExplanation: string;
  tryAgain: string;
  recorded: (attempts: number) => string;
  clearProgress: string;
  clearConfirmation: string;
  confirmClear: string;
  cancelClear: string;
  storageWarning: string;
}

export const conceptCheckUiCopy = {
  "zh-CN": {
    eyebrow: "Concept Check",
    heading: "用一个问题检验核心直觉",
    nonBlockingNote:
      "自测只帮助你检查理解，不影响继续学习。记录仅保存在本设备。",
    submit: "提交答案",
    correctHeading: "回答正确",
    incorrectHeading: "还差一步",
    correctSummary: "你抓住了本章最重要的机制关系。",
    incorrectSummary: "先看解释，再用同一个问题重新判断。",
    showExplanation: "查看为什么",
    hideExplanation: "收起解释",
    tryAgain: "再试一次",
    recorded: (attempts) => `本章自测已记录 · ${attempts} 次尝试`,
    clearProgress: "清除全部自测记录",
    clearConfirmation: "确定清除这台设备上的全部自测记录？",
    confirmClear: "确定清除",
    cancelClear: "取消",
    storageWarning: "本设备无法保存自测记录；你仍可作答并查看解释。",
  },
  en: {
    eyebrow: "Concept Check",
    heading: "Test The Core Intuition With One Question",
    nonBlockingNote:
      "This check supports reflection and never blocks the next chapter. Records stay on this device.",
    submit: "Submit answer",
    correctHeading: "Correct",
    incorrectHeading: "One Step Away",
    correctSummary: "You identified the chapter's most important mechanism.",
    incorrectSummary:
      "Read the explanation, then reconsider the same question.",
    showExplanation: "See why",
    hideExplanation: "Hide explanation",
    tryAgain: "Try again",
    recorded: (attempts) =>
      `Concept check recorded · ${attempts} ${attempts === 1 ? "attempt" : "attempts"}`,
    clearProgress: "Clear all self-check records",
    clearConfirmation: "Clear every self-check record stored on this device?",
    confirmClear: "Clear records",
    cancelClear: "Cancel",
    storageWarning:
      "This device cannot save self-check records. You can still answer and read the explanation.",
  },
} satisfies Record<Locale, ConceptCheckUiCopy>;
