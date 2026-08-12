import type {
  ConceptCheckProgress,
  ConceptCheckResult,
} from "./conceptCheckProgress";
import { learningPath, type LearningChapterId } from "./learningPath";

export function getReviewQueue(
  progress: ConceptCheckProgress,
): ConceptCheckResult[] {
  const resultsByChapterId = new Map<LearningChapterId, ConceptCheckResult>(
    progress.results.map((result) => [result.chapterId, result]),
  );

  return learningPath.flatMap(({ id }) => {
    const result = resultsByChapterId.get(id);
    return result?.reviewSuggested ? [{ ...result }] : [];
  });
}
