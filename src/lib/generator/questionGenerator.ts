import {
  ChoiceQuestion,
  MatchingQuestion,
  Question,
  CategoryId,
  MatchingPair,
  QuizSessionConfig,
} from '@/types';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';

export const AVAILABLE_CATEGORY_IDS: CategoryId[] = [
  'greek',
  'hebrew_christian',
  'islam',
  'indian_buddhism',
  'chinese_philosophy',
  'japan_buddhism_thought',
  'adolescence_public',
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class QuestionGenerator {
  /**
   * 形式1: 人物 ➔ 語句
   * 例: 「ソクラテス」に対応する語句はどれか？
   */
  static generateFigureToKeyword(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = KEYWORDS.filter((k) => {
      if (categoryId) return k.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(k.categoryId);
    });

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      if (!figure) return;

      const correctAnswer = kw.name;

      // 1. 対比ペアのキーワードを最優先
      let contrastKws: string[] = [];
      if (figure.contrastFigureIds && figure.contrastFigureIds.length > 0) {
        contrastKws = KEYWORDS.filter((k) =>
          figure.contrastFigureIds?.includes(k.figureId)
        ).map((k) => k.name);
      }

      // 2. 同単元の他キーワード
      const sameCatKws = KEYWORDS.filter(
        (k) => k.id !== kw.id && k.categoryId === kw.categoryId && k.figureId !== figure.id
      ).map((k) => k.name);

      // 3. 他単元のキーワード
      const otherCatKws = KEYWORDS.filter((k) => k.categoryId !== kw.categoryId).map((k) => k.name);

      const rawPool = [...shuffle(contrastKws), ...shuffle(sameCatKws), ...shuffle(otherCatKws)];
      const distractors = Array.from(new Set(rawPool))
        .filter((t) => t !== correctAnswer && !t.includes(correctAnswer) && !correctAnswer.includes(t))
        .slice(0, 3);

      if (distractors.length < 3) return;

      const options = shuffle([correctAnswer, ...distractors]);

      questions.push({
        id: `q_f2k_${kw.id}`,
        type: 'figure_to_keyword',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: `「${figure.name}」に対応する語句はどれか？`,
        context: `${figure.eraDetail} / ${figure.mainConcept}`,
        options,
        correctAnswer,
        explanation: `【正解】「${kw.name}」 ⇄ ${figure.name}\n${kw.definition}`,
      });
    });

    return questions;
  }

  /**
   * 形式2: 語句 ➔ 人物
   * 例: 「アパテイア（不動心）」に対応する人物は誰か？
   */
  static generateKeywordToFigure(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = KEYWORDS.filter((k) => {
      if (categoryId) return k.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(k.categoryId);
    });

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      if (!figure) return;

      const correctAnswer = figure.name;

      // 1. 対比ペアの思想家
      let contrastFigNames: string[] = [];
      if (figure.contrastFigureIds && figure.contrastFigureIds.length > 0) {
        contrastFigNames = FIGURES.filter((f) => figure.contrastFigureIds?.includes(f.id)).map(
          (f) => f.name
        );
      }

      // 2. 同単元の他思想家
      const sameCatFigs = FIGURES.filter(
        (f) => f.id !== figure.id && f.categoryId === figure.categoryId
      ).map((f) => f.name);

      // 3. 他単元の思想家
      const otherCatFigs = FIGURES.filter((f) => f.categoryId !== figure.categoryId).map(
        (f) => f.name
      );

      const rawPool = [...shuffle(contrastFigNames), ...shuffle(sameCatFigs), ...shuffle(otherCatFigs)];
      const distractors = Array.from(new Set(rawPool))
        .filter((name) => name !== correctAnswer)
        .slice(0, 3);

      if (distractors.length < 3) return;

      const options = shuffle([correctAnswer, ...distractors]);

      questions.push({
        id: `q_k2f_${kw.id}`,
        type: 'keyword_to_figure',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: `「${kw.name}」に対応する人物は誰か？`,
        context: kw.definition,
        options,
        correctAnswer,
        explanation: `【正解】${figure.name} ⇄ 「${kw.name}」\n${figure.mainConcept}`,
      });
    });

    return questions;
  }

  /**
   * 形式3: 仲間はずれ（対応しない語句）
   * 例: 「プラトン」に対応しない語句はどれか？
   */
  static generateOddOneOut(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetFigures = FIGURES.filter((f) => {
      if (categoryId && f.categoryId !== categoryId) return false;
      if (!AVAILABLE_CATEGORY_IDS.includes(f.categoryId)) return false;
      const kws = KEYWORDS.filter((k) => k.figureId === f.id);
      return kws.length >= 2; // 2つ以上語句を持つ人物
    });

    targetFigures.forEach((figure) => {
      const myKeywords = KEYWORDS.filter((k) => k.figureId === figure.id);
      if (myKeywords.length === 0) return;

      // 自身の語句
      let ownKwNames = myKeywords.map((k) => k.name);
      if (ownKwNames.length < 3) {
        // 2つの場合は複製等せず、同じ人物のメイン概念等ではなく他の単元を埋める
        const extraDummyOwn = KEYWORDS.filter((k) => k.categoryId === figure.categoryId && k.figureId !== figure.id);
        if (extraDummyOwn.length === 0) return;
      }
      ownKwNames = shuffle(ownKwNames).slice(0, 3);
      if (ownKwNames.length < 3) return;

      // 仲間はずれ（他人の語句：対比相手優先）
      let candidateFigures = FIGURES.filter((f) => f.id !== figure.id);
      if (figure.contrastFigureIds && figure.contrastFigureIds.length > 0) {
        const contrasts = FIGURES.filter((f) => figure.contrastFigureIds?.includes(f.id));
        if (contrasts.length > 0) candidateFigures = contrasts;
      }

      const randomOtherFig = shuffle(candidateFigures)[0];
      if (!randomOtherFig) return;

      const otherKws = KEYWORDS.filter((k) => k.figureId === randomOtherFig.id);
      if (otherKws.length === 0) return;

      const oddKeyword = shuffle(otherKws)[0];
      const correctAnswer = oddKeyword.name; // これが正解（対応しない語句）

      const options = shuffle([...ownKwNames, correctAnswer]);

      questions.push({
        id: `q_odd_${figure.id}_${oddKeyword.id}`,
        type: 'odd_one_out',
        categoryId: figure.categoryId,
        figureId: figure.id,
        keywordId: oddKeyword.id,
        prompt: `「${figure.name}」に対応【しない】語句はどれか？`,
        context: `${figure.eraDetail} / ${figure.mainConcept}`,
        options,
        correctAnswer,
        explanation: `【正解】「${oddKeyword.name}」は【${randomOtherFig.name}】に対応します。\n※ ${figure.name}の対応語句: ${myKeywords.map((k) => k.name).join('、')}`,
      });
    });

    return questions;
  }

  /**
   * 形式4: ペア正誤判定
   * 例: 人物と語句の組み合わせとして【正しいもの】はどれか？
   */
  static generatePairValidation(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetFigures = FIGURES.filter((f) => {
      if (categoryId && f.categoryId !== categoryId) return false;
      return AVAILABLE_CATEGORY_IDS.includes(f.categoryId);
    });

    if (targetFigures.length < 4) return [];

    targetFigures.forEach((correctFig) => {
      const correctKws = KEYWORDS.filter((k) => k.figureId === correctFig.id);
      if (correctKws.length === 0) return;
      const correctKw = shuffle(correctKws)[0];

      const correctPair = `${correctFig.name} ── ${correctKw.name}`;

      // 誤りペアを3つ生成（対比思想家との入れ替えひっかけ）
      const otherFigures = shuffle(targetFigures.filter((f) => f.id !== correctFig.id));
      const wrongPairs: string[] = [];
      const wrongNotes: string[] = [];

      for (const fig of otherFigures) {
        if (wrongPairs.length >= 3) break;
        const anotherFig = shuffle(targetFigures.filter((f) => f.id !== fig.id))[0];
        if (!anotherFig) continue;
        const anotherKws = KEYWORDS.filter((k) => k.figureId === anotherFig.id);
        if (anotherKws.length === 0) continue;
        const wrongKw = shuffle(anotherKws)[0];

        const pairStr = `${fig.name} ── ${wrongKw.name}`;
        if (!wrongPairs.includes(pairStr)) {
          wrongPairs.push(pairStr);
          wrongNotes.push(`・${pairStr}（※「${wrongKw.name}」は${anotherFig.name}）`);
        }
      }

      if (wrongPairs.length < 3) return;

      const options = shuffle([correctPair, ...wrongPairs]);

      questions.push({
        id: `q_pair_${correctFig.id}_${correctKw.id}`,
        type: 'pair_validation',
        categoryId: correctFig.categoryId,
        figureId: correctFig.id,
        keywordId: correctKw.id,
        prompt: `人物と語句の組み合わせとして【正しいもの】はどれか？`,
        context: `${correctFig.name} 関連`,
        options,
        correctAnswer: correctPair,
        explanation: `【正解】${correctPair}\n\n[誤りの組み合わせ]\n${wrongNotes.join('\n')}`,
      });
    });

    return questions;
  }

  /**
   * 形式5: 線つなぎ問題（3組対応 ＋ 3つのダミーで計6選択肢）
   */
  static generateMatchingQuestions(categoryId?: CategoryId): MatchingQuestion[] {
    const questions: MatchingQuestion[] = [];
    const targetCategories = categoryId ? [categoryId] : AVAILABLE_CATEGORY_IDS;

    targetCategories.forEach((catId) => {
      const figuresInCat = FIGURES.filter((f) => f.categoryId === catId);
      if (figuresInCat.length < 3) return;

      const shuffledFigs = shuffle(figuresInCat);
      for (let i = 0; i <= shuffledFigs.length - 3; i += 3) {
        const group = shuffledFigs.slice(i, i + 3);
        const pairs: MatchingPair[] = [];
        let valid = true;

        group.forEach((fig) => {
          const kws = KEYWORDS.filter((k) => k.figureId === fig.id);
          if (kws.length === 0) {
            valid = false;
            return;
          }
          const chosenKw = shuffle(kws)[0];
          pairs.push({
            id: `pair_${fig.id}_${chosenKw.id}`,
            left: fig.name,
            right: chosenKw.name,
          });
        });

        if (valid && pairs.length === 3) {
          questions.push({
            id: `q_match_${catId}_${i}`,
            type: 'matching_lines',
            categoryId: catId,
            prompt: `左列の「人物」と、右列の対応する「語句」を線でつなげ。`,
            context: `3組を選択（余り選択肢あり）`,
            pairs,
            explanation: `【正解の対応関係】\n${pairs.map((p) => `・${p.left} ⇄ ${p.right}`).join('\n')}`,
          });
        }
      }
    });

    return questions;
  }

  /**
   * 全問題プールを生成（記述式を完全廃止）
   */
  static getAllQuestions(categoryId?: CategoryId): Question[] {
    return [
      ...this.generateFigureToKeyword(categoryId),
      ...this.generateKeywordToFigure(categoryId),
      ...this.generateOddOneOut(categoryId),
      ...this.generatePairValidation(categoryId),
      ...this.generateMatchingQuestions(categoryId),
    ];
  }

  /**
   * カスタムセッション（問題数・形式・単元）の生成
   */
  static generateCustomSession(config: QuizSessionConfig): Question[] {
    const pool: Question[] = [];

    config.categoryIds.forEach((catId) => {
      if (config.enabledTypes.figureToKeyword) {
        pool.push(...this.generateFigureToKeyword(catId));
      }
      if (config.enabledTypes.keywordToFigure) {
        pool.push(...this.generateKeywordToFigure(catId));
      }
      if (config.enabledTypes.oddOneOut) {
        pool.push(...this.generateOddOneOut(catId));
      }
      if (config.enabledTypes.pairValidation) {
        pool.push(...this.generatePairValidation(catId));
      }
      if (config.enabledTypes.matching) {
        pool.push(...this.generateMatchingQuestions(catId));
      }
    });

    const shuffled = shuffle(pool);
    if (config.questionCount >= 999) {
      return shuffled;
    }
    return shuffled.slice(0, config.questionCount);
  }
}
