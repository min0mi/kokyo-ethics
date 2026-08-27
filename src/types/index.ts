// TypeScript 型定義: 公共倫理パーフェクトマスター

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
  title: string;
  figureId: string;
  categoryId: CategoryId;
  description: string;
  keyTakeaway: string;
}

export type QuestionType =
  | 'figure_to_keyword'       // 人物から説いた語句を選ぶ
  | 'keyword_to_figure'       // 語句から説いた人物を選ぶ
  | 'keyword_meaning'         // 語句の意味・判断語句の正誤
  | 'figure_to_book'          // 人物から著書を選ぶ
  | 'book_to_figure'          // 著書から著者を当てる
  | 'figure_to_episode'       // エピソードから人物を当てる
  | 'matching_lines'          // 線つなぎ・ペアマッチング
  | 'fill_in_keyword'         // 記述式問題（語句入力）
  | 'recall_classification';  // 分類想起（自己評価）

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  categoryId: CategoryId;
  prompt: string;
  context?: string;
  explanation: string;
  commonTestHint?: string; // 共テ攻略ワンポイント
  figureId?: string;
  keywordId?: string;
  bookId?: string;
  episodeId?: string;
}

// 4択選択問題
export interface ChoiceQuestion extends BaseQuestion {
  type:
    | 'figure_to_keyword'
    | 'keyword_to_figure'
    | 'keyword_meaning'
    | 'figure_to_book'
    | 'book_to_figure'
    | 'figure_to_episode';
  options: string[];
  correctAnswer: string;
}

// 線つなぎ・マッチング問題
export interface MatchingPair {
  left: string;   // 例: 人物名
  right: string;  // 例: キーワードや著書名
  id: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching_lines';
  pairs: MatchingPair[];
}

// 記述式問題
export interface TypingQuestion extends BaseQuestion {
  type: 'fill_in_keyword';
  correctAnswers: string[]; // 漢字、ひらがな、別称などの許容配列
  displayHint?: string;     // 文字数や頭文字ヒント
}

// 分類想起問題
export interface RecallQuestion extends BaseQuestion {
  type: 'recall_classification';
  targetCategoryName: string;
  requiredCount: number;
  expectedAnswers: string[]; // 想定される人物や語句のリスト
  modelAnswerDetails: { name: string; note: string }[];
}

export type Question = ChoiceQuestion | MatchingQuestion | TypingQuestion | RecallQuestion;

// 忘却曲線 (SM-2) 状態
export type MasteryState = 'new' | 'learning' | 'review' | 'mastered';

export interface UserProgressItem {
  questionId: string;
  repetitionCount: number;
  easeFactor: number;        // デフォルト 2.5
  intervalDays: number;      // 次回までの間隔（日）
  nextReviewAt: string;      // ISO 8601
  lastReviewedAt: string;    // ISO 8601
  correctStreak: number;     // 連続正解数
  totalAttempts: number;
  totalCorrect: number;
  state: MasteryState;
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
}

export interface QuizSessionStats {
  total: number;
  correct: number;
  xpEarned: number;
  newBadges: Badge[];
  streakUpdated: boolean;
  accuracy: number;
  timeSpentSeconds: number;
}

