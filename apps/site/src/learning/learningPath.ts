const definitions = [
  { id: "overview", route: "/chapters/overview/", kind: "chapter" },
  { id: "search", route: "/chapters/search/", kind: "demo" },
  { id: "expert-system", route: "/chapters/expert-system/", kind: "demo" },
  { id: "bayes", route: "/chapters/bayes/", kind: "demo" },
  {
    id: "decision-boundary",
    route: "/chapters/decision-boundary/",
    kind: "demo",
  },
  { id: "cnn", route: "/chapters/cnn/", kind: "demo" },
  { id: "attention", route: "/chapters/attention/", kind: "demo" },
  { id: "llm-system", route: "/chapters/llm-system/", kind: "chapter" },
  { id: "rag", route: "/chapters/rag/", kind: "demo" },
  { id: "agent", route: "/chapters/agent/", kind: "demo" },
] as const;

export type LearningChapterId = (typeof definitions)[number]["id"];
export type LearningChapterKind = (typeof definitions)[number]["kind"];

export interface LearningChapter {
  id: LearningChapterId;
  route: string;
  kind: LearningChapterKind;
}

export interface LearningPathContext {
  current: LearningChapter;
  position: number;
  total: number;
  previous?: LearningChapter;
  next?: LearningChapter;
}

export const learningPath: readonly LearningChapter[] = definitions;

const learningChapterIds = new Set<string>(learningPath.map(({ id }) => id));

export function isLearningChapterId(
  value: unknown,
): value is LearningChapterId {
  return typeof value === "string" && learningChapterIds.has(value);
}

export function getLearningPathContext(
  id: LearningChapterId,
): LearningPathContext {
  const index = learningPath.findIndex((chapter) => chapter.id === id);
  const current = learningPath[index];

  if (!current) {
    throw new Error(`Learning chapter is missing from the path: ${id}`);
  }

  return {
    current,
    position: index + 1,
    total: learningPath.length,
    previous: learningPath[index - 1],
    next: learningPath[index + 1],
  };
}

export function getFirstIncompleteChapter(
  completedIds: readonly LearningChapterId[],
): LearningChapter | undefined {
  const completed = new Set(completedIds);
  return learningPath.find(({ id }) => !completed.has(id));
}

export function isLearningPathComplete(
  completedIds: readonly LearningChapterId[],
): boolean {
  const completed = new Set(completedIds);
  return learningPath.every(({ id }) => completed.has(id));
}
