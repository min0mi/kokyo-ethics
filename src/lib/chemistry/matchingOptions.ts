import { MatchingQuestion } from '@/types';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';

function shuffle<T>(values: T[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function buildMatchingOptions(question: MatchingQuestion) {
  const targetColors = new Set(question.pairs.map((pair) => FIGURES.find((color) => color.name === pair.left)?.id));
  const correct = question.pairs.map((pair) => ({ id: pair.id, text: pair.right, isDummy: false }));
  // A different substance of the same color would also be a correct match.
  // Never offer such a substance as a dummy option.
  const candidates = KEYWORDS.filter((kw) => !targetColors.has(kw.figureId) && !correct.some((option) => option.text === kw.name));
  const dummies = shuffle(candidates).slice(0, Math.max(0, 6 - correct.length))
    .map((kw) => ({ id: `dummy_${kw.id}`, text: kw.name, isDummy: true }));
  return shuffle([...correct, ...dummies]);
}
