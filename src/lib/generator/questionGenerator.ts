import {
  ChoiceQuestion,
  MatchingQuestion,
  TypingQuestion,
  RecallQuestion,
  Question,
  CategoryId,
  MatchingPair,
} from '@/types';
import { FIGURES } from '@/data/figures';
import { KEYWORDS } from '@/data/keywords';
import { BOOKS } from '@/data/books';
import { EPISODES } from '@/data/episodes';
import { CATEGORIES } from '@/data/categories';

// 源流思想のカテゴリID一覧
export const AVAILABLE_CATEGORY_IDS: CategoryId[] = [
  'greek',
  'hebrew_christian',
  'islam',
  'indian_buddhism',
  'chinese_philosophy',
];

// 配列シャッフル
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
   * 人物 → キーワード選択問題
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

      // 同一カテゴリ内の他キーワードを優先して誤選択肢にする（交叉）
      const sameCat = KEYWORDS.filter((k) => k.id !== kw.id && k.categoryId === kw.categoryId);
      const otherCat = KEYWORDS.filter((k) => k.categoryId !== kw.categoryId);

      const pool = [...shuffle(sameCat), ...shuffle(otherCat)];
      const distractors = pool.slice(0, 3).map((k) => k.name);
      const options = shuffle([kw.name, ...distractors]);

      questions.push({
        id: `q_f2k_${kw.id}`,
        type: 'figure_to_keyword',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: `【${figure.name}】が説いた思想・キーワードとして最も適切なものはどれか。`,
        context: `${figure.eraDetail} / ${figure.mainConcept}`,
        options,
        correctAnswer: kw.name,
        explanation: `【正解】${kw.name}\n\n[人物の解説: ${figure.name}]\n${figure.summary}\n\n[語句の意味: ${kw.name}]\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * キーワード → 人物選択問題
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

      const sameCat = FIGURES.filter((f) => f.id !== figure.id && f.categoryId === kw.categoryId);
      const otherCat = FIGURES.filter((f) => f.categoryId !== kw.categoryId);

      const pool = [...shuffle(sameCat), ...shuffle(otherCat)];
      const distractors = pool.slice(0, 3).map((f) => f.name);
      const options = shuffle([figure.name, ...distractors]);

      questions.push({
        id: `q_k2f_${kw.id}`,
        type: 'keyword_to_figure',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: `「${kw.name}」を提唱・展開した人物は誰か。`,
        context: `定義: ${kw.definition}`,
        options,
        correctAnswer: figure.name,
        explanation: `【正解】${figure.name}\n\n「${kw.name}」は${figure.name}の重要概念です。\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * キーワードの意味・判断語句正誤問題
   */
  static generateKeywordMeaning(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = KEYWORDS.filter((k) => {
      if (categoryId) return k.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(k.categoryId);
    });

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      const figureName = figure ? `（${figure.name}）` : '';

      const sameCat = KEYWORDS.filter((k) => k.id !== kw.id && k.categoryId === kw.categoryId);
      const otherCat = KEYWORDS.filter((k) => k.categoryId !== kw.categoryId);

      const pool = [...shuffle(sameCat), ...shuffle(otherCat)];
      const distractors = pool.slice(0, 3).map((k) => k.definition);
      const options = shuffle([kw.definition, ...distractors]);

      questions.push({
        id: `q_km_${kw.id}`,
        type: 'keyword_meaning',
        categoryId: kw.categoryId,
        figureId: kw.figureId,
        keywordId: kw.id,
        prompt: `「${kw.name}」${figureName}の意味・内容として最も適切なものはどれか。`,
        options,
        correctAnswer: kw.definition,
        explanation: `【正解】${kw.definition}\n\n[詳細解説]\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * 人物 ⇄ 著書選択問題
   */
  static generateBookQuestions(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetBooks = BOOKS.filter((b) => {
      if (categoryId) return b.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(b.categoryId);
    });

    targetBooks.forEach((book) => {
      const figure = FIGURES.find((f) => f.id === book.figureId);
      if (!figure) return;

      const otherBooks = BOOKS.filter((b) => b.id !== book.id);
      const bookDistractors = shuffle(otherBooks).slice(0, 3).map((b) => b.title);
      const bookOptions = shuffle([book.title, ...bookDistractors]);

      questions.push({
        id: `q_f2b_${book.id}`,
        type: 'figure_to_book',
        categoryId: book.categoryId,
        figureId: figure.id,
        bookId: book.id,
        prompt: `【${figure.name}】が著した著作として最も適切なものはどれか。`,
        options: bookOptions,
        correctAnswer: book.title,
        explanation: `【正解】${book.title}（著: ${figure.name}）\n\n${book.description}`,
      });

      const otherFigures = FIGURES.filter((f) => f.id !== figure.id);
      const figDistractors = shuffle(otherFigures).slice(0, 3).map((f) => f.name);
      const figOptions = shuffle([figure.name, ...figDistractors]);

      questions.push({
        id: `q_b2f_${book.id}`,
        type: 'book_to_figure',
        categoryId: book.categoryId,
        figureId: figure.id,
        bookId: book.id,
        prompt: `著作${book.title}の著者として正しいものはどれか。`,
        context: book.description,
        options: figOptions,
        correctAnswer: figure.name,
        explanation: `【正解】${figure.name}\n\n${book.title}は${figure.name}の代表的著作です。\n${book.description}`,
      });
    });

    return questions;
  }

  /**
   * エピソード問題
   */
  static generateEpisodeQuestions(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetEpisodes = EPISODES.filter((e) => {
      if (categoryId) return e.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(e.categoryId);
    });

    targetEpisodes.forEach((ep) => {
      const figure = FIGURES.find((f) => f.id === ep.figureId);
      if (!figure) return;

      const otherFigures = FIGURES.filter((f) => f.id !== figure.id);
      const figDistractors = shuffle(otherFigures).slice(0, 3).map((f) => f.name);
      const options = shuffle([figure.name, ...figDistractors]);

      questions.push({
        id: `q_ep_${ep.id}`,
        type: 'figure_to_episode',
        categoryId: ep.categoryId,
        figureId: figure.id,
        episodeId: ep.id,
        prompt: `次のエピソードにまつわる思想家は誰か。\n\n「${ep.description}」`,
        context: `エピソード: ${ep.title}`,
        options,
        correctAnswer: figure.name,
        explanation: `【正解】${figure.name}\n\n[背景と要点]\n${ep.keyTakeaway}`,
      });
    });

    return questions;
  }

  /**
   * 線つなぎマッチング問題
   * ★要件: 左側3〜4個に対して、右側の選択肢数を「必ず6個」にして余るダミー選択肢を出現させる！
   */
  static generateMatchingQuestions(categoryId?: CategoryId): MatchingQuestion[] {
    const questions: MatchingQuestion[] = [];
    const targetCatIds = categoryId ? [categoryId] : AVAILABLE_CATEGORY_IDS;

    targetCatIds.forEach((catId) => {
      const cat = CATEGORIES.find((c) => c.id === catId);
      if (!cat) return;

      const catFigures = FIGURES.filter((f) => f.categoryId === catId);
      if (catFigures.length < 3) return;

      // 3人〜4人の人物を選出
      const selectedFigures = shuffle(catFigures).slice(0, 3);
      const pairs: MatchingPair[] = [];

      selectedFigures.forEach((fig) => {
        const kw = KEYWORDS.find((k) => k.figureId === fig.id);
        const bk = BOOKS.find((b) => b.figureId === fig.id);

        if (kw) {
          pairs.push({
            id: fig.id,
            left: fig.name,
            right: kw.name,
          });
        } else if (bk) {
          pairs.push({
            id: fig.id,
            left: fig.name,
            right: bk.title,
          });
        }
      });

      if (pairs.length >= 3) {
        questions.push({
          id: `q_match_${cat.id}_${Date.now()}`,
          type: 'matching_lines',
          categoryId: cat.id,
          prompt: `【${cat.shortName}】思想家と、その人物が説いたキーワード・主著を正しく組み合わせよ。（※右側の選択肢には不要な語句が余分に含まれています）`,
          pairs,
          explanation: `各思想家と主要概念の対応関係を正確に記憶することが、共通テストの得点源となります。`,
        });
      }
    });

    return questions;
  }

  /**
   * キーワード記述問題
   */
  static generateTypingQuestions(categoryId?: CategoryId): TypingQuestion[] {
    const questions: TypingQuestion[] = [];
    const targetKeywords = KEYWORDS.filter((k) => {
      if (categoryId) return k.categoryId === categoryId;
      return AVAILABLE_CATEGORY_IDS.includes(k.categoryId);
    });

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      const figureName = figure ? figure.name : '';

      const cleanName = kw.name.replace(/（.*?）/g, '').trim();
      const reading = kw.reading;
      const full = kw.name.trim();
      const correctAnswers = Array.from(new Set([cleanName, reading, full]));

      questions.push({
        id: `q_type_${kw.id}`,
        type: 'fill_in_keyword',
        categoryId: kw.categoryId,
        figureId: kw.figureId,
        keywordId: kw.id,
        prompt: `以下の説明文が表す思想用語・キーワードを記述せよ。\n（提唱者: ${figureName}）`,
        context: kw.definition,
        correctAnswers,
        displayHint: `頭文字: ${reading.charAt(0)} / ${reading.length}文字`,
        explanation: `【正解】${kw.name}（読み: ${kw.reading}）\n\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * 分類想起問題
   */
  static generateRecallQuestions(categoryId?: CategoryId): RecallQuestion[] {
    const questions: RecallQuestion[] = [];

    const recallPresets = [
      {
        id: 'recall_greek_trio',
        categoryId: 'greek' as CategoryId,
        targetCategoryName: '古代ギリシャの代表的哲学者（アテネ期）',
        requiredCount: 3,
        expectedAnswers: ['ソクラテス', 'プラトン', 'アリストテレス'],
        modelAnswerDetails: [
          { name: 'ソクラテス', note: '無知の知、魂への配慮、問答法' },
          { name: 'プラトン', note: 'イデア論、四元徳、哲人政治、アカデメイア' },
          { name: 'アリストテレス', note: '形相と質料、中庸、ポリス的動物、リュケイオン' },
        ],
      },
      {
        id: 'recall_chinese_confucian',
        categoryId: 'chinese_philosophy' as CategoryId,
        targetCategoryName: '中国儒家の代表的思想家',
        requiredCount: 3,
        expectedAnswers: ['孔子', '孟子', '荀子'],
        modelAnswerDetails: [
          { name: '孔子', note: '仁と礼、徳治主義、論語' },
          { name: '孟子', note: '性善説、四端の心、王道政治、易姓革命' },
          { name: '荀子', note: '性悪説、礼治主義、化性起偽' },
        ],
      },
      {
        id: 'recall_chinese_daoist',
        categoryId: 'chinese_philosophy' as CategoryId,
        targetCategoryName: '中国道家の代表的思想家',
        requiredCount: 2,
        expectedAnswers: ['老子', '荘子'],
        modelAnswerDetails: [
          { name: '老子', note: '無為自然、上善如水、小国寡民' },
          { name: '荘子', note: '万物斉同、胡蝶の夢、逍遥遊' },
        ],
      },
      {
        id: 'recall_hellenism',
        categoryId: 'greek' as CategoryId,
        targetCategoryName: 'ヘレニズム期の代表学派（エピクロス派・ストア派）の祖',
        requiredCount: 2,
        expectedAnswers: ['エピクロス', 'ゼノン'],
        modelAnswerDetails: [
          { name: 'エピクロス', note: 'アタラクシア（平静心）、快楽主義、隠れて生きよ' },
          { name: 'ゼノン（ストア派）', note: 'アパテイア（不動心）、禁欲主義、自然に従え' },
        ],
      },
    ];

    recallPresets.forEach((item) => {
      if (categoryId && item.categoryId !== categoryId) return;

      questions.push({
        id: `q_recall_${item.id}`,
        type: 'recall_classification',
        categoryId: item.categoryId,
        prompt: `【想起トレーニング】「${item.targetCategoryName}」に該当する人物を【${item.requiredCount}人】頭の中で思い浮かべよ。`,
        context: `思い浮かべたら「模範解答を表示する」を押して自己評価を行ってください。`,
        targetCategoryName: item.targetCategoryName,
        requiredCount: item.requiredCount,
        expectedAnswers: item.expectedAnswers,
        modelAnswerDetails: item.modelAnswerDetails,
        explanation: `思想史の全体像を把握するため、特定の学派・流派ごとに人物と概念をグループ化して想起するトレーニングです。`,
      });
    });

    return questions;
  }

  /**
   * 全問題プールを取得（源流思想を基本対象とする）
   */
  static getAllQuestions(categoryId?: CategoryId): Question[] {
    return [
      ...this.generateFigureToKeyword(categoryId),
      ...this.generateKeywordToFigure(categoryId),
      ...this.generateKeywordMeaning(categoryId),
      ...this.generateBookQuestions(categoryId),
      ...this.generateEpisodeQuestions(categoryId),
      ...this.generateMatchingQuestions(categoryId),
      ...this.generateTypingQuestions(categoryId),
      ...this.generateRecallQuestions(categoryId),
    ];
  }
}
