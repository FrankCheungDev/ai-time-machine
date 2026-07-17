import {
  chapterRegistry,
  isChapterId,
  type ChapterId,
  type ChapterKind,
} from "@ai-history/data/chapters";

export type LearningChapterId = ChapterId;
export type LearningChapterKind = ChapterKind;

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

export const learningPath: readonly LearningChapter[] = chapterRegistry.map(
  ({ id, route, kind }) => ({ id, route, kind }),
);

export function isLearningChapterId(
  value: unknown,
): value is LearningChapterId {
  return isChapterId(value);
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
