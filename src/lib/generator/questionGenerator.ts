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

// ユーティリティ: 配列のシャッフル
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 交叉生成エンジン
export class QuestionGenerator {
  /**
   * 人物 → キーワード選択問題を生成
   */
  static generateFigureToKeyword(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = categoryId
      ? KEYWORDS.filter((k) => k.categoryId === categoryId)
      : KEYWORDS;

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      if (!figure) return;

      // 同一カテゴリ内の他キーワードを優先して誤選択肢にする（交叉ロジック）
      const sameCategoryOthers = KEYWORDS.filter(
        (k) => k.id !== kw.id && k.categoryId === kw.categoryId
      );
      const differentCategoryOthers = KEYWORDS.filter(
        (k) => k.categoryId !== kw.categoryId
      );

      const pool = [...shuffle(sameCategoryOthers), ...shuffle(differentCategoryOthers)];
      const distractors = pool.slice(0, 3).map((k) => k.name);
      const options = shuffle([kw.name, ...distractors]);

      questions.push({
        id: `q_f2k_${kw.id}`,
        type: 'figure_to_keyword',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: `【${figure.name}】が説いた思想・キーワードとして最も適切なものはどれか？`,
        context: `${figure.eraDetail} / ${figure.mainConcept}`,
        options,
        correctAnswer: kw.name,
        explanation: `【正解】${kw.name}\n\n■${figure.name}の解説:\n${figure.summary}\n\n■${kw.name}の意味:\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * キーワード → 人物選択問題を生成
   */
  static generateKeywordToFigure(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = categoryId
      ? KEYWORDS.filter((k) => k.categoryId === categoryId)
      : KEYWORDS;

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      if (!figure) return;

      // 同一カテゴリ内の他人物を優先して誤選択肢にする
      const sameCategoryFigures = FIGURES.filter(
        (f) => f.id !== figure.id && f.categoryId === kw.categoryId
      );
      const diffCategoryFigures = FIGURES.filter(
        (f) => f.categoryId !== kw.categoryId
      );

      const pool = [...shuffle(sameCategoryFigures), ...shuffle(diffCategoryFigures)];
      const distractors = pool.slice(0, 3).map((f) => f.name);
      const options = shuffle([figure.name, ...distractors]);

      questions.push({
        id: `q_k2f_${kw.id}`,
        type: 'keyword_to_figure',
        categoryId: kw.categoryId,
        figureId: figure.id,
        keywordId: kw.id,
        prompt: `「${kw.name}」を提唱・展開した人物は誰か？`,
        context: `定義：${kw.definition}`,
        options,
        correctAnswer: figure.name,
        explanation: `【正解】${figure.name}\n\n「${kw.name}」は${figure.name}の重要概念です。\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * キーワードの意味・判断語句の正誤選択問題を生成
   */
  static generateKeywordMeaning(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetKeywords = categoryId
      ? KEYWORDS.filter((k) => k.categoryId === categoryId)
      : KEYWORDS;

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      const figureName = figure ? figure.name : '';

      // 他のキーワードの定義を誤選択肢として使用
      const sameCategoryOthers = KEYWORDS.filter(
        (k) => k.id !== kw.id && k.categoryId === kw.categoryId
      );
      const diffCategoryOthers = KEYWORDS.filter(
        (k) => k.categoryId !== kw.categoryId
      );

      const pool = [...shuffle(sameCategoryOthers), ...shuffle(diffCategoryOthers)];
      const distractors = pool.slice(0, 3).map((k) => k.definition);
      const options = shuffle([kw.definition, ...distractors]);

      questions.push({
        id: `q_km_${kw.id}`,
        type: 'keyword_meaning',
        categoryId: kw.categoryId,
        figureId: kw.figureId,
        keywordId: kw.id,
        prompt: `「${kw.name}」${figureName ? `（${figureName}）` : ''}の意味・内容として最も適切なものはどれか？`,
        options,
        correctAnswer: kw.definition,
        explanation: `【正解】${kw.definition}\n\n■詳細解説:\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * 人物 ⇄ 著書選択問題を生成
   */
  static generateBookQuestions(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetBooks = categoryId
      ? BOOKS.filter((b) => b.categoryId === categoryId)
      : BOOKS;

    targetBooks.forEach((book) => {
      const figure = FIGURES.find((f) => f.id === book.figureId);
      if (!figure) return;

      // ① 人物 → 著書
      const otherBooks = BOOKS.filter((b) => b.id !== book.id);
      const bookDistractors = shuffle(otherBooks).slice(0, 3).map((b) => b.title);
      const bookOptions = shuffle([book.title, ...bookDistractors]);

      questions.push({
        id: `q_f2b_${book.id}`,
        type: 'figure_to_book',
        categoryId: book.categoryId,
        figureId: figure.id,
        bookId: book.id,
        prompt: `【${figure.name}】が著した主著・著作として最も適切なものはどれか？`,
        options: bookOptions,
        correctAnswer: book.title,
        explanation: `【正解】${book.title}（著：${figure.name}）\n\n${book.description}`,
        commonTestHint: `共テでは著者の組み合わせや時代順の並び替えでも問われます。`,
      });

      // ② 著書 → 人物
      const otherFigures = FIGURES.filter((f) => f.id !== figure.id);
      const figDistractors = shuffle(otherFigures).slice(0, 3).map((f) => f.name);
      const figOptions = shuffle([figure.name, ...figDistractors]);

      questions.push({
        id: `q_b2f_${book.id}`,
        type: 'book_to_figure',
        categoryId: book.categoryId,
        figureId: figure.id,
        bookId: book.id,
        prompt: `著作${book.title}の著者として正しいものはどれか？`,
        context: book.description,
        options: figOptions,
        correctAnswer: figure.name,
        explanation: `【正解】${figure.name}\n\n${book.title}は${figure.name}の代表的著作です。\n${book.description}`,
      });
    });

    return questions;
  }

  /**
   * エピソード選択問題を生成
   */
  static generateEpisodeQuestions(categoryId?: CategoryId): ChoiceQuestion[] {
    const questions: ChoiceQuestion[] = [];
    const targetEpisodes = categoryId
      ? EPISODES.filter((e) => e.categoryId === categoryId)
      : EPISODES;

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
        prompt: `次のエピソードにまつわる思想家は誰か？\n\n「${ep.description}」`,
        context: `エピソード：${ep.title}`,
        options,
        correctAnswer: figure.name,
        explanation: `【正解】${figure.name}\n\n【背景・ポイント】${ep.keyTakeaway}`,
      });
    });

    return questions;
  }

  /**
   * 線つなぎマッチング問題を生成（各カテゴリから3〜4組のペアを作成）
   */
  static generateMatchingQuestions(categoryId?: CategoryId): MatchingQuestion[] {
    const questions: MatchingQuestion[] = [];
    const categoriesToProcess = categoryId
      ? CATEGORIES.filter((c) => c.id === categoryId)
      : CATEGORIES;

    categoriesToProcess.forEach((cat) => {
      const catFigures = FIGURES.filter((f) => f.categoryId === cat.id);
      if (catFigures.length < 3) return;

      // 3組または4組の人物とキーワード/著書のペアを作成
      const selectedFigures = shuffle(catFigures).slice(0, 4);
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
          prompt: `【${cat.shortName}】思想家と、その人物が説いたキーワード・主著を正しく組み合わせよ。`,
          pairs,
          explanation: `各思想家と主要概念の対応関係を正確に記憶することが、共通テストの得点源となります。`,
        });
      }
    });

    return questions;
  }

  /**
   * キーワード記述問題を生成
   */
  static generateTypingQuestions(categoryId?: CategoryId): TypingQuestion[] {
    const questions: TypingQuestion[] = [];
    const targetKeywords = categoryId
      ? KEYWORDS.filter((k) => k.categoryId === categoryId)
      : KEYWORDS;

    targetKeywords.forEach((kw) => {
      const figure = FIGURES.find((f) => f.id === kw.figureId);
      const figureName = figure ? figure.name : '';

      // 許容回答（漢字、ひらがな、英語、省略表記など）
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
        prompt: `以下の説明文が表す思想用語・キーワードを記述せよ。\n（提唱者：${figureName}）`,
        context: kw.definition,
        correctAnswers,
        displayHint: `頭文字: ${reading.charAt(0)} / ${reading.length}文字`,
        explanation: `【正解】${kw.name}（読み：${kw.reading}）\n\n${kw.explanation}`,
        commonTestHint: kw.commonTestPoint,
      });
    });

    return questions;
  }

  /**
   * 分類想起問題を生成
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
        id: 'recall_empiricism',
        categoryId: 'modern_western_early' as CategoryId,
        targetCategoryName: 'イギリス経験論の代表的思想家',
        requiredCount: 3,
        expectedAnswers: ['ベーコン', 'ロック', 'ヒューム', 'バークリ'],
        modelAnswerDetails: [
          { name: 'フランシス・ベーコン', note: '帰納法、知は力なり、四つのイドラ' },
          { name: 'ジョン・ロック', note: 'タブラ・ラサ（白紙）、自然権と抵抗権' },
          { name: 'デイヴィッド・ヒューム', note: '懐疑論、自我は知覚の束' },
        ],
      },
      {
        id: 'recall_kamakura_buddhism',
        categoryId: 'japan_buddhism_thought' as CategoryId,
        targetCategoryName: '鎌倉新仏教の主要な開祖',
        requiredCount: 4,
        expectedAnswers: ['法然', '親鸞', '道元', '日蓮', '栄西', '一遍'],
        modelAnswerDetails: [
          { name: '法然', note: '浄土宗・専修念仏' },
          { name: '親鸞', note: '浄土真宗・悪人正機説・絶対他力' },
          { name: '道元', note: '曹洞宗・只管打坐・修証一等' },
          { name: '日蓮', note: '日蓮宗・題目・立正安国論' },
        ],
      },
      {
        id: 'recall_existentialism',
        categoryId: 'contemporary_existentialism' as CategoryId,
        targetCategoryName: '現代の実存主義哲学者',
        requiredCount: 3,
        expectedAnswers: ['ヤスパース', 'ハイデッガー', 'サルトル', 'ボーヴォワール'],
        modelAnswerDetails: [
          { name: 'ヤスパース', note: '限界状況、超越者' },
          { name: 'ハイデッガー', note: '現存在、世人、死への先駆' },
          { name: 'サルトル', note: '実存は本質に先立つ、アンガージュマン' },
        ],
      },
      {
        id: 'recall_justice',
        categoryId: 'justice_political_ethics' as CategoryId,
        targetCategoryName: '現代の正義論・社会思想家',
        requiredCount: 3,
        expectedAnswers: ['ロールズ', 'ノージック', 'サンデル', 'セン'],
        modelAnswerDetails: [
          { name: 'ロールズ', note: '無知のヴェール、格差原理、公正としての正義' },
          { name: 'ノージック', note: 'リバタリアニズム、自己所有権、最小国家論' },
          { name: 'サンデル', note: 'コミュニタリアニズム、共通善' },
          { name: 'セン', note: '潜在能力（ケイパビリティ）アプローチ' },
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
        context: `思い浮かべたら「解答を確認」を押して自己採点を行ってください。`,
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
   * 全問題プールを一括取得
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

