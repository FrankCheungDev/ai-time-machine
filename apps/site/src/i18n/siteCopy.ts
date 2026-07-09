import type { Locale } from "./locales";

export const languageStorageKey = "ai-history-locale";

export interface DemoCoreCopy {
  demoKicker: string;
  learningGoalsLabel: string;
  simplificationLabel: string;
  previousLabel: string;
  nextLabel: string;
  fitLabel: string;
  detailLabel: string;
  scrollSuffix: string;
}

export interface SiteCopy {
  siteTitle: string;
  defaultDescription: string;
  navLabel: string;
  nav: {
    home: string;
    timeline: string;
    lineage: string;
    chapters: string;
    diagrams: string;
  };
  language: {
    currentLabel: string;
    switchLabel: string;
    switchAriaLabel: string;
  };
  demoCore: DemoCoreCopy;
}

export const siteCopy = {
  "zh-CN": {
    siteTitle: "交互式人工智能图解史",
    defaultDescription:
      "交互式人工智能图解史：用图解、动画和轻量交互解释 AI 技术演化。",
    navLabel: "主导航",
    nav: {
      home: "总览",
      timeline: "时间线",
      lineage: "谱系图",
      chapters: "章节主线",
      diagrams: "图源",
    },
    language: {
      currentLabel: "中文",
      switchLabel: "English",
      switchAriaLabel: "Switch language to English",
    },
    demoCore: {
      demoKicker: "教学型交互案例",
      learningGoalsLabel: "学习目标",
      simplificationLabel: "简化说明",
      previousLabel: "上一步",
      nextLabel: "下一步",
      fitLabel: "适配屏幕",
      detailLabel: "放大查看",
      scrollSuffix: "可适配屏幕或横向滚动查看完整图解",
    },
  },
  en: {
    siteTitle: "Interactive Illustrated AI History",
    defaultDescription:
      "An interactive illustrated history of AI, explaining technical evolution with diagrams, animation, and lightweight demos.",
    navLabel: "Primary navigation",
    nav: {
      home: "Overview",
      timeline: "Timeline",
      lineage: "Lineage",
      chapters: "Chapters",
      diagrams: "Diagram sources",
    },
    language: {
      currentLabel: "English",
      switchLabel: "中文",
      switchAriaLabel: "切换语言为中文",
    },
    demoCore: {
      demoKicker: "Teaching interaction",
      learningGoalsLabel: "Learning goals",
      simplificationLabel: "Simplification note",
      previousLabel: "Previous",
      nextLabel: "Next",
      fitLabel: "Fit screen",
      detailLabel: "Zoom in",
      scrollSuffix:
        "can fit the screen or scroll horizontally for the full diagram",
    },
  },
} satisfies Record<Locale, SiteCopy>;

export function getSiteCopy(locale: Locale): SiteCopy {
  return siteCopy[locale];
}
