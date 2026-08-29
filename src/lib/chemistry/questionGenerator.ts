import {
  ChoiceQuestion,
  MatchingQuestion,
  Question,
  CategoryId,
  MatchingPair,
  QuizSessionConfig,
} from '@/types';
import { FIGURES } from '@/data/chemistry/figures';
import { KEYWORDS } from '@/data/chemistry/keywords';
import { CATEGORIES } from '@/data/chemistry/categories';

export const AVAILABLE_CATEGORY_IDS: CategoryId[] = CATEGORIES.filter((cat) => cat.isAvailable).map((cat) => cat.id);

function getCategoryGroup(catId: CategoryId): string {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return cat ? cat.groupName : '';
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 問題として有効か検証するユーティリティ */
function isValidQuestion(q: ChoiceQuestion): boolean {
  if (q.options.length !== 4) return false;
  if (!q.options.includes(q.correctAnswer)) return false;
  if (new Set(q.options).size !== q.options.length) return false;
  if (!q.correctAnswer || q.correctAnswer.trim() === '') return false;
  if (!q.prompt || q.prompt.trim() === '') return false;
  return true;
}

export class QuestionGenerator {
  static generateFigureToKeyword(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = KEYWORDS.filter((k) => {
      if (categoryId) return k.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(k.categoryId);
    });

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      if (!figure) return;
      if (!kw.name || kw.name.trim() === '') return;

      const correctAnswer = kw.name;

      let contrastKws: string[] = [];
      if (figure.contrastFigureIds && figure.contrastFigureIds.length > 0) {
        contrastKws = KEYWORDS.filter((k) =>
          figure.contrastFigureIds?.includes(k.figureId) &&
          k.figureId !== figure.id &&
          k.name.trim() !== ''
        ).map((k) => k.name);
      }

      const sameCatKws = KEYWORDS.filter(
        (k) => k.id !== kw.id &&
          k.categoryId === kw.categoryId &&
          k.figureId !== figure.id &&
          k.name.trim() !== ''
      ).map((k) => k.name);

      const currentGroup = getCategoryGroup(kw.categoryId);

      const sameGroupKws = KEYWORDS.filter(
        (k) => k.categoryId !== kw.categoryId &&
          getCategoryGroup(k.categoryId) === currentGroup &&
          k.figureId !== figure.id &&
          k.name.trim() !== ''
      ).map((k) => k.name);

      const otherGroupKws = KEYWORDS.filter(
        (k) => getCategoryGroup(k.categoryId) !== currentGroup &&
          k.figureId !== figure.id &&
          k.name.trim() !== ''
      ).map((k) => k.name);

      const rawPool = [
        ...shuffle(contrastKws),
        ...shuffle(sameCatKws),
        ...shuffle(sameGroupKws),
        ...shuffle(otherGroupKws)
      ];
      const distractors = Array.from(new Set(rawPool))
        .filter((t) => t !== correctAnswer && t.trim() !== '')
        .slice(0, 3);

      if (distractors.length < 3) return;

      const options = shuffle([correctAnswer, ...distractors]);

      const q: ChoiceQuestion = {
        id: `q_f2k_${kw.id}`,
        type: 'figure_to_keyword',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: kw.categoryId === 'cat_flame'
          ? `「${figure.name}」の炎色反応を示す元素はどれか？`
          : `「${figure.name}」を示す物質はどれか？`,
        context: kw.categoryId === 'cat_flame' ? `炎色反応：${figure.name}` : `色：${figure.name}`,
        options,
        correctAnswer,
        explanation: `【正解】「${kw.name}」は${figure.name}を呈します。\n${kw.definition}`,
      };

      if (isValidQuestion(q)) questions.push(q);
    });

    return questions;
  }

  static generateKeywordToFigure(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = KEYWORDS.filter((k) => {
      if (categoryId) return k.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(k.categoryId);
    });

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      if (!figure) return;
      if (!kw.name || kw.name.trim() === '') return;

      const correctAnswer = figure.name;

      let contrastFigNames: string[] = [];
      if (figure.contrastFigureIds && figure.contrastFigureIds.length > 0) {
        contrastFigNames = FIGURES.filter((f) => figure.contrastFigureIds?.includes(f.id)).map((f) => f.name);
      }

      const sameCatFigs = FIGURES.filter(
        (f) => f.id !== figure.id && f.categoryId === figure.categoryId
      ).map((f) => f.name);

      const currentGroup = getCategoryGroup(figure.categoryId);

      const sameGroupFigs = FIGURES.filter(
        (f) => f.categoryId !== figure.categoryId &&
          getCategoryGroup(f.categoryId) === currentGroup &&
          f.id !== figure.id
      ).map((f) => f.name);

      const otherGroupFigs = FIGURES.filter(
        (f) => getCategoryGroup(f.categoryId) !== currentGroup && f.id !== figure.id
      ).map((f) => f.name);

      const flameReactionColors = kw.categoryId === 'cat_flame'
        ? targetKeywords
            .filter((candidate) => candidate.id !== kw.id)
            .map((candidate) => FIGURES.find((f) => f.id === candidate.figureId)?.name)
            .filter((name): name is string => !!name)
        : [];

      const rawPool = [
        ...shuffle(flameReactionColors),
        ...shuffle(contrastFigNames),
        ...shuffle(sameCatFigs),
        ...shuffle(sameGroupFigs),
        ...shuffle(otherGroupFigs)
      ];
      const distractors = Array.from(new Set(rawPool))
        .filter((name) => name !== correctAnswer && name.trim() !== '')
        .slice(0, 3);

      if (distractors.length < 3) return;

      const options = shuffle([correctAnswer, ...distractors]);

      const q: ChoiceQuestion = {
        id: `q_k2f_${kw.id}`,
        type: 'keyword_to_figure',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: kw.categoryId === 'cat_flame'
          ? `「${kw.name}」の炎色反応の色はどれか？`
          : `物質「${kw.name}」の色はどれか？`,
        context: kw.categoryId === 'cat_flame' ? `炎色反応：${kw.name}` : `物質：${kw.name}`,
        options,
        correctAnswer,
        explanation: `【正解】「${kw.name}」の色は「${figure.name}」です。\n${figure.mainConcept}なども同じグループです。`,
      };

      if (isValidQuestion(q)) questions.push(q);
    });

    return questions;
  }

  static generateOddOneOut(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetFigures = FIGURES.filter((f) => {
      const kws = KEYWORDS.filter((k) => k.figureId === f.id && (!categoryId || k.categoryId === categoryId) && k.name.trim() !== '');
      return kws.length >= 3;
    });

    targetFigures.forEach((figure) => {
      const myKeywords = KEYWORDS.filter((k) => k.figureId === figure.id && (!categoryId || k.categoryId === categoryId) && k.name.trim() !== '');
      if (myKeywords.length < 3) return;

      const ownKwNames = shuffle(myKeywords).slice(0, 3).map((k) => k.name);
      if (ownKwNames.length < 3) return;

      const currentGroup = getCategoryGroup(figure.categoryId);
      let candidateFigures = FIGURES.filter(
        (f) => f.id !== figure.id &&
          AVAILABLE_CATEGORY_IDS.includes(f.categoryId) &&
          getCategoryGroup(f.categoryId) === currentGroup
      );
      if (candidateFigures.length === 0) {
        candidateFigures = FIGURES.filter(
          (f) => f.id !== figure.id && AVAILABLE_CATEGORY_IDS.includes(f.categoryId)
        );
      }
      if (figure.contrastFigureIds && figure.contrastFigureIds.length > 0) {
        const contrasts = FIGURES.filter((f) => figure.contrastFigureIds?.includes(f.id));
        if (contrasts.length > 0) candidateFigures = contrasts;
      }

      candidateFigures = candidateFigures.filter((f) =>
        KEYWORDS.some((k) => k.figureId === f.id && (!categoryId || k.categoryId === categoryId) && k.name.trim() !== '')
      );

      if (candidateFigures.length === 0) return;

      const randomOtherFig = [...candidateFigures].sort((a, b) => a.id.localeCompare(b.id))[0];
      const otherKws = KEYWORDS.filter((k) => k.figureId === randomOtherFig.id && (!categoryId || k.categoryId === categoryId) && k.name.trim() !== '');
      if (otherKws.length === 0) return;

      const myKwNamesAll = myKeywords.map((k) => k.name);
      const validOddKws = [...otherKws].sort((a, b) => a.id.localeCompare(b.id)).filter((k) => !myKwNamesAll.includes(k.name));
      if (validOddKws.length === 0) return;

      const oddKeyword = validOddKws[0];
      const correctAnswer = oddKeyword.name;

      if (ownKwNames.includes(correctAnswer)) return;

      const options = shuffle([...ownKwNames, correctAnswer]);

      const q: ChoiceQuestion = {
        id: `q_odd_${figure.id}_${[...myKeywords.map((k) => k.id), oddKeyword.id].sort().join('_')}`,
        type: 'odd_one_out',
        categoryId: categoryId || oddKeyword.categoryId,
        figureId: figure.id,
        keywordId: oddKeyword.id,
        prompt: `「${figure.name}」を呈する物質として【誤っているもの（当てはまらないもの）】はどれか？`,
        context: `色：${figure.name}`,
        options,
        correctAnswer,
        explanation: `【正解】「${oddKeyword.name}」は【${randomOtherFig.name}】を呈します。\n※ ${figure.name}の物質: ${myKeywords.map((k) => k.name).join('、')}`,
      };

      if (isValidQuestion(q)) questions.push(q);
    });

    return questions;
  }

  static generatePairValidation(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetFigures = FIGURES.filter((f) => {
      const kws = KEYWORDS.filter((k) => k.figureId === f.id && (!categoryId || k.categoryId === categoryId) && k.name.trim() !== '');
      return kws.length > 0;
    });

    if (targetFigures.length < 4) return [];

    targetFigures.forEach((correctFig) => {
      const correctKws = KEYWORDS.filter((k) => k.figureId === correctFig.id && (!categoryId || k.categoryId === categoryId) && k.name.trim() !== '');
      if (correctKws.length === 0) return;
      const correctKw = [...correctKws].sort((a, b) => a.id.localeCompare(b.id))[0];

      const correctPair = `${correctFig.name} ── ${correctKw.name}`;

      const otherFigures = shuffle(targetFigures.filter((f) => f.id !== correctFig.id));
      const wrongPairs: string[] = [];
      const wrongNotes: string[] = [];

      for (const fig of otherFigures) {
        if (wrongPairs.length >= 3) break;

        const figRealKwNames = KEYWORDS.filter((k) => k.figureId === fig.id).map((k) => k.name);

        const currentGroup = getCategoryGroup(fig.categoryId);
        let donorFigures = shuffle(
          targetFigures.filter((f) =>
            f.id !== fig.id &&
            f.id !== correctFig.id &&
            getCategoryGroup(f.categoryId) === currentGroup
          )
        );
        if (donorFigures.length === 0) {
          donorFigures = shuffle(
            targetFigures.filter((f) => f.id !== fig.id && f.id !== correctFig.id)
          );
        }

        let wrongKwName: string | null = null;
        let donorFig = null;

        for (const donor of donorFigures) {
          const donorKws = KEYWORDS.filter((k) => k.figureId === donor.id && (!categoryId || k.categoryId === categoryId) && k.name.trim() !== '');
          const validKws = donorKws.filter((k) => !figRealKwNames.includes(k.name));
          if (validKws.length > 0) {
            const picked = shuffle(validKws)[0];
            wrongKwName = picked.name;
            donorFig = donor;
            break;
          }
        }

        if (!wrongKwName || !donorFig) continue;

        const pairStr = `${fig.name} ── ${wrongKwName}`;
        if (!wrongPairs.includes(pairStr)) {
          wrongPairs.push(pairStr);
          wrongNotes.push(`・${pairStr}（※「${wrongKwName}」は${donorFig.name}）`);
        }
      }

      if (wrongPairs.length < 3) return;

      const options = shuffle([correctPair, ...wrongPairs]);
      if (!options.includes(correctPair)) return;

      const q: ChoiceQuestion = {
        id: `q_pair_${correctFig.id}_${correctKw.id}`,
        type: 'pair_validation',
        categoryId: correctKw.categoryId,
        figureId: correctFig.id,
        keywordId: correctKw.id,
        prompt: `物質とその呈する色の組み合わせとして【正しいもの】はどれか？`,
        context: `物質と色の関係`,
        options,
        correctAnswer: correctPair,
        explanation: `【正解】${correctPair}\n\n[誤りの組み合わせ]\n${wrongNotes.join('\n')}`,
      };

      if (isValidQuestion(q)) questions.push(q);
    });

    return questions;
  }

  static generateMatchingQuestions(categoryId?: CategoryId): MatchingQuestion[] {
    const questions: MatchingQuestion[] = [];
    const targetCategories = categoryId ? [categoryId] : AVAILABLE_CATEGORY_IDS;

    targetCategories.forEach((catId) => {
      const figuresInCat = FIGURES.filter(
        (f) => KEYWORDS.some((k) => k.categoryId === catId && k.figureId === f.id && k.name.trim() !== '')
      );
      if (figuresInCat.length < 3) return;

      const shuffledFigs = [...figuresInCat].sort((a, b) => a.id.localeCompare(b.id));
      for (let i = 0; i <= shuffledFigs.length - 3; i += 3) {
        const group = shuffledFigs.slice(i, i + 3);
        const pairs: MatchingPair[] = [];
        let valid = true;

        const usedKeywordNames = new Set<string>();

        group.forEach((fig) => {
          const kws = KEYWORDS.filter((k) => k.categoryId === catId && k.figureId === fig.id && k.name.trim() !== '');
          if (kws.length === 0) { valid = false; return; }

          const availableKws = [...kws].sort((a, b) => a.id.localeCompare(b.id)).filter((k) => !usedKeywordNames.has(k.name));
          if (availableKws.length === 0) { valid = false; return; }

          const chosenKw = availableKws[0];
          usedKeywordNames.add(chosenKw.name);
          pairs.push({
            id: `pair_${fig.id}_${chosenKw.id}`,
            left: fig.name,
            right: chosenKw.name,
          });
        });

        if (
          valid &&
          pairs.length === 3 &&
          pairs.every((p) => p.left.trim() !== '' && p.right.trim() !== '')
        ) {
          questions.push({
            id: `q_match_${catId}_${pairs.map((pair) => pair.id).sort().join('_')}`,
            type: 'matching_lines',
            categoryId: catId,
            prompt: `左列の「色」と、右列の対応する「物質」を正しく線でつなげ。`,
            context: `3組を選択（余り選択肢あり）`,
            pairs,
            explanation: `【正解の対応関係】\n${pairs.map((p) => `・${p.left} ⇄ ${p.right}`).join('\n')}`,
          });
        }
      }
    });

    return questions;
  }

  static getAllQuestions(categoryId?: CategoryId): Question[] {
    if (!categoryId) return AVAILABLE_CATEGORY_IDS.flatMap((id) => this.getAllQuestions(id));
    return [
      ...this.generateFigureToKeyword(categoryId),
      ...this.generateKeywordToFigure(categoryId),
    ];
  }

  static generateCustomSession(config: QuizSessionConfig): Question[] {
    const pool: Question[] = [];

    config.categoryIds.filter((catId) => AVAILABLE_CATEGORY_IDS.includes(catId)).forEach((catId) => {
      if (config.enabledTypes.figureToKeyword) pool.push(...this.generateFigureToKeyword(catId));
      if (config.enabledTypes.keywordToFigure) pool.push(...this.generateKeywordToFigure(catId));
    });

    const shuffled = shuffle(pool);
    if (config.questionCount >= 999) return shuffled;
    return shuffled.slice(0, config.questionCount);
  }
}
