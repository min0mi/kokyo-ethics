// ==========================================
// 共通テスト「公共、倫理」データ型定義
// ==========================================

export type CategoryId =
  | 'greek'
  | 'hebrew_christian'
  | 'islam'
  | 'indian_buddhism'
  | 'chinese_philosophy'
  | 'japan_buddhism_thought'
  | 'modern_western_early'
  | 'german_idealism'
  | 'utilitarianism'
  | 'modern_criticism'
  | 'contemporary_existentialism'
  | 'pragmatism_analytic'
  | 'frankfurt_structuralism'
  | 'justice_political_ethics'
  | 'bioethics_environmental'
  | 'adolescence_public';

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
  tags: string[];
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
  explanation: string;
  commonTestPoint: string; // 共通テストでの判断語句・ひっかけポイント
  distractorTags: string[];
  contrastKeywordIds?: string[]; // 対比される用語
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
// 問題形式の型定義
// ==========================================
export type QuestionType =
  | 'figure_to_keyword'
  | 'keyword_to_figure'
  | 'keyword_meaning'
  | 'figure_to_book'
  | 'book_to_figure'
  | 'figure_to_episode'
  | 'matching_lines'
  | 'fill_in_keyword'
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
    choice: boolean;
    matching: boolean;
    typing: boolean;
    recall: boolean;
  };
  questionCount: number; // 5, 10, 20, 30, または全問(999)
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
  dailyCounts?: Record<string, DailyCount>;
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
