import { UserProgressItem, Question } from '@/types';

export interface CategoryDetailedStats {
  total: number;
  mastered: number;
  correct: number;
  wrong: number;
  unattempted: number;
  studyRate: number;     // 学習率 (%): 解いたことのある問題の割合
  masteredRate: number;  // 定着率 (%)
  correctRate: number;   // 正答中率 (%)
  wrongRate: number;     // 誤答率 (%)
  rate: number;          // 互換性のための定着率
  learning: number;      // 互換性用
}

export class SRSEngine {
  private static readonly DEFAULT_EASE_FACTOR = 2.5;
  private static readonly MIN_EASE_FACTOR = 1.3;

  /**
   * 新規プログレス項目の生成
   */
  static createInitialProgress(questionId: string): UserProgressItem {
    const now = new Date().toISOString();
    return {
      questionId,
      repetitionCount: 0,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      intervalDays: 0,
      nextReviewAt: now,
      lastReviewedAt: now,
      correctStreak: 0,
      totalAttempts: 0,
      totalCorrect: 0,
      state: 'new',
    };
  }

  /**
   * 回答結果から次回の復習日時・間隔・習熟度を計算
   */
  static recordAnswer(
    current: UserProgressItem | undefined,
    questionId: string,
    isCorrect: boolean,
    grade: number = isCorrect ? 4 : 1
  ): UserProgressItem {
    const now = new Date();
    const item: UserProgressItem = current
      ? { ...current }
      : this.createInitialProgress(questionId);

    item.totalAttempts += 1;
    item.lastReviewedAt = now.toISOString();

    if (isCorrect) {
      item.totalCorrect += 1;
      item.correctStreak += 1;

      // 間隔計算 (SM-2 改良)
      if (item.repetitionCount === 0) {
        item.intervalDays = 1;
        item.state = 'learning';
      } else if (item.repetitionCount === 1) {
        item.intervalDays = 3;
        item.state = 'review';
      } else if (item.repetitionCount === 2) {
        item.intervalDays = 7;
        item.state = 'review';
      } else if (item.repetitionCount === 3) {
        item.intervalDays = 14;
        item.state = 'review';
      } else {
        item.intervalDays = Math.round(item.intervalDays * item.easeFactor);
        if (item.intervalDays >= 30) {
          item.state = 'mastered';
        }
      }

      item.repetitionCount += 1;

      // Ease Factor (難易度係数) の微調整
      const newEase =
        item.easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
      item.easeFactor = Math.max(this.MIN_EASE_FACTOR, Math.min(3.0, newEase));
    } else {
      // 不正解時のペナルティ
      item.correctStreak = 0;
      item.repetitionCount = 0;
      item.intervalDays = 1; // 明日再復習
      item.state = 'learning';
      item.easeFactor = Math.max(this.MIN_EASE_FACTOR, item.easeFactor - 0.2);
    }

    // 次回復習予定日の設定
    const nextDate = new Date(now.getTime() + item.intervalDays * 24 * 60 * 60 * 1000);
    item.nextReviewAt = nextDate.toISOString();

    return item;
  }

  /**
   * 今日復習すべき（期日が到来している）問題を抽出
   */
  static getDueQuestions(
    allQuestions: Question[],
    progressMap: Record<string, UserProgressItem>
  ): Question[] {
    const now = new Date();

    return allQuestions.filter((q) => {
      const progress = progressMap[q.id];
      if (!progress) return false;
      const nextReview = new Date(progress.nextReviewAt);
      return nextReview <= now && progress.state !== 'mastered';
    });
  }

  /**
   * 単元（カテゴリ）ごとの学習率・定着率・正答率・誤答率を精緻に算出
   */
  static calculateCategoryStats(
    categoryQuestions: Question[],
    progressMap: Record<string, UserProgressItem>
  ): CategoryDetailedStats {
    const total = categoryQuestions.length;
    if (total === 0) {
      return {
        total: 0,
        mastered: 0,
        correct: 0,
        wrong: 0,
        unattempted: 0,
        studyRate: 0,
        masteredRate: 0,
        correctRate: 0,
        wrongRate: 0,
        rate: 0,
        learning: 0,
      };
    }

    let mastered = 0;
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    categoryQuestions.forEach((q) => {
      const p = progressMap[q.id];
      if (!p || p.totalAttempts === 0 || p.state === 'new') {
        unattempted += 1;
      } else if (p.state === 'mastered') {
        mastered += 1;
      } else if (p.correctStreak > 0) {
        correct += 1;
      } else {
        wrong += 1;
      }
    });

    const attemptedCount = mastered + correct + wrong;
    const studyRate = Math.round((attemptedCount / total) * 100);
    const masteredRate = Math.round((mastered / total) * 100);
    const correctRate = Math.round((correct / total) * 100);
    const wrongRate = Math.round((wrong / total) * 100);

    return {
      total,
      mastered,
      correct,
      wrong,
      unattempted,
      studyRate,
      masteredRate,
      correctRate,
      wrongRate,
      rate: studyRate,
      learning: correct + wrong,
    };
  }
}
