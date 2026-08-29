// ==========================================
// 共通テスト「公共、倫理」データ型定義
// ==========================================

export type CategoryId =
  | 'greek'
  | 'hebrew_christian'
  | 'islam'
  | 'indian_buddhism'
  | 'chinese_philosophy'
  | 'japan_ancient_kamakura'
  | 'japan_muromachi_modern'
  | 'japan_buddhism_thought'
  | 'western_modern'
  | 'western_contemporary'
  | 'adolescence_public'
  | 'public_politics'
  | 'public_economy'
  | 'public_international'
  | (string & {});

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  era: string;
  description: string;
  iconName: string;
  orderIndex: number;
  isAvailable?: boolean;
}

export interface FigureRelation {
  targetFigureId: string;
  relationType: 'oppose' | 'inherit' | 'criticize' | 'teacher' | 'student';
  label: string;
  description: string;
}

export interface Figure {
  id: string;
  name: string;
  englishName?: string;
  categoryId: CategoryId;
  eraDetail: string;
  mainConcept: string;
  summary: string;
  books?: string[]; // 主著・代表的著作
  tags?: string[];
  contrastFigureIds?: string[]; // 共テ頻出の対比人物ID
  relations?: FigureRelation[]; // 思想の有機的相関・系譜
}

export interface Keyword {
  id: string;
  name: string;
  reading: string;
  figureId: string;
  categoryId: CategoryId;
  definition: string;
  importance?: number;
  explanation?: string;
  commonTestPoint?: string; // 共通テストでの判断語句・ひっかけポイント
  distractorTags?: string[];
  contrastKeywordIds?: string[]; // 対比される用語
  baseName?: string;
  formula?: string;
  phase?: string;
  condition?: string;
  precipitateId?: string;
  sources?: string[];
  tags?: string[];
}

export interface Book {
  id: string;
  title: string;
  reading: string;
  figureId: string;
  categoryId: CategoryId;
  description: string;
}

export interface Episode {
  id: string;
  figureId: string;
  categoryId: CategoryId;
  title: string;
  description: string;
  keyTakeaway: string;
}

// ==========================================
// 問題形式の型定義（人物・語句の対応関係特化）
// ==========================================
export type QuestionType =
  | 'figure_to_keyword' // 人物 ➔ 語句
  | 'keyword_to_figure' // 語句 ➔ 人物
  | 'odd_one_out'       // 仲間はずれ（対応しない語句）
  | 'pair_validation'   // ペア正誤判定
  | 'matching_lines'    // 線つなぎ（6択）
  | 'recall_classification';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  categoryId: CategoryId;
  figureId?: string;
  keywordId?: string;
  prompt: string;
  context?: string;
  explanation: string;
  commonTestHint?: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  options: string[];
  correctAnswer: string;
  bookId?: string;
  episodeId?: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  pairs: MatchingPair[];
}

export interface TypingQuestion extends BaseQuestion {
  correctAnswers: string[];
  displayHint?: string;
}

export interface RecallModelAnswer {
  name: string;
  note: string;
}

export interface RecallQuestion extends BaseQuestion {
  targetCategoryName: string;
  requiredCount: number;
  expectedAnswers: string[];
  modelAnswerDetails: RecallModelAnswer[];
}

export type Question =
  | ChoiceQuestion
  | MatchingQuestion
  | TypingQuestion
  | RecallQuestion;

// 統一演習設定の型
export interface QuizSessionConfig {
  categoryIds: CategoryId[];
  enabledTypes: {
    figureToKeyword: boolean;
    keywordToFigure: boolean;
    oddOneOut: boolean;
    pairValidation: boolean;
    matching: boolean;
  };
  questionCount: number; // 5, 10, 20, 30, または全問(999)
  onlyWeak?: boolean;    // 間違えた問題のみ
}

// ==========================================
// 忘却曲線 (SRS) & ユーザー進捗の型定義
// ==========================================
export type MasteryState = 'new' | 'learning' | 'review' | 'mastered';

export interface UserProgressItem {
  questionId: string;
  repetitionCount: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string;
  correctStreak: number;
  totalAttempts: number;
  totalCorrect: number;
  state: MasteryState;
}

export interface DailyCount {
  total: number;
  correct: number;
  studyTimeSeconds?: number; // その日の学習時間（秒）
}

export interface UserProfile {
  id: string;
  username: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  unlockedBadgeIds: string[];
  isGuest: boolean;
  totalAnswered: number;
  totalCorrect: number;
  totalStudyTimeSeconds?: number; // 通算学習時間（秒）
  dailyCounts?: Record<string, DailyCount>;
  excellentCount?: number;
  greatCount?: number;
  goodCount?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'total_answers' | 'mastery' | 'speed' | 'category_clear';
  targetValue: number;
  unlockedAt?: string;
}
