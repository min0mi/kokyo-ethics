import { UserProfile, UserProgressItem, Badge } from '@/types';
import { BADGES } from '@/data/badges';
import { SRSEngine } from '@/lib/srs/srsEngine';

const STORAGE_KEYS = {
  PROFILE: 'kokyo_user_profile',
  PROGRESS: 'kokyo_user_progress',
  SETTINGS: 'kokyo_user_settings',
};

export class UserDataStore {
  /**
   * プロファイルの初期化または取得
   */
  static getProfile(): UserProfile {
    if (typeof window === 'undefined') {
      return this.getDefaultProfile();
    }

    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.dailyCounts) {
          parsed.dailyCounts = {};
        }
        this.checkStreak(parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }

    const initial = this.getDefaultProfile();
    this.saveProfile(initial);
    return initial;
  }

  private static getDefaultProfile(): UserProfile {
    const today = new Date().toISOString().split('T')[0];
    return {
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: '探求者',
      xp: 0,
      level: 1,
      streakDays: 1,
      lastActiveDate: today,
      unlockedBadgeIds: [],
      isGuest: true,
      totalAnswered: 0,
      totalCorrect: 0,
      dailyCounts: {
        [today]: { total: 0, correct: 0 },
      },
    };
  }

  static saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  /**
   * 連続ログイン（ストリーク）の判定・更新
   */
  private static checkStreak(profile: UserProfile): void {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = profile.lastActiveDate;

    if (lastDate === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      profile.streakDays += 1;
    } else {
      profile.streakDays = 1;
    }

    profile.lastActiveDate = today;
    this.saveProfile(profile);
  }

  /**
   * 全問題の学習進捗マップを取得
   */
  static getProgressMap(): Record<string, UserProgressItem> {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!saved) return {};
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse progress map', e);
      return {};
    }
  }

  static saveProgressMap(map: Record<string, UserProgressItem>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(map));
  }

  /**
   * 1問解答時の総合データ更新処理（日別カウント加算付き）
   */
  static recordAnswer(
    questionId: string,
    isCorrect: boolean,
    rating?: number
  ): {
    updatedProgress: UserProgressItem;
    profile: UserProfile;
    newlyUnlockedBadges: Badge[];
  } {
    const progressMap = this.getProgressMap();
    const profile = this.getProfile();
    const today = new Date().toISOString().split('T')[0];

    // SRS 計算
    const currentItem = progressMap[questionId];
    const updatedProgress = SRSEngine.recordAnswer(
      currentItem,
      questionId,
      isCorrect,
      rating
    );
    progressMap[questionId] = updatedProgress;
    this.saveProgressMap(progressMap);

    // プロファイル更新
    profile.totalAnswered += 1;
    if (isCorrect) {
      profile.totalCorrect += 1;
      profile.xp += 10;
    } else {
      profile.xp += 2;
    }

    // 日別カウントの加算
    if (!profile.dailyCounts) {
      profile.dailyCounts = {};
    }
    if (!profile.dailyCounts[today]) {
      profile.dailyCounts[today] = { total: 0, correct: 0 };
    }
    profile.dailyCounts[today].total += 1;
    if (isCorrect) {
      profile.dailyCounts[today].correct += 1;
    }

    // レベル計算: XPから計算 (Lv = floor(sqrt(XP / 50)) + 1)
    profile.level = Math.floor(Math.sqrt(profile.xp / 50)) + 1;

    // バッジ解放判定
    const newlyUnlockedBadges: Badge[] = [];
    BADGES.forEach((badge) => {
      if (profile.unlockedBadgeIds.includes(badge.id)) return;

      let isUnlocked = false;
      if (badge.category === 'total_answers' && profile.totalAnswered >= badge.targetValue) {
        isUnlocked = true;
      } else if (badge.category === 'streak' && profile.streakDays >= badge.targetValue) {
        isUnlocked = true;
      } else if (badge.id === 'first_step' && profile.totalAnswered >= 1) {
        isUnlocked = true;
      }

      if (isUnlocked) {
        profile.unlockedBadgeIds.push(badge.id);
        badge.unlockedAt = new Date().toISOString();
        newlyUnlockedBadges.push(badge);
        profile.xp += 50;
      }
    });

    this.saveProfile(profile);

    return {
      updatedProgress,
      profile,
      newlyUnlockedBadges,
    };
  }

  /**
   * 過去 N 日間の日別学習履歴を取得（折れ線グラフ用）
   */
  static getDailyHistory(days: number = 7): { date: string; label: string; total: number; correct: number }[] {
    const profile = this.getProfile();
    const counts = profile.dailyCounts || {};
    const result: { date: string; label: string; total: number; correct: number }[] = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const label = `${month}/${day}`;

      const entry = counts[dateStr] || { total: 0, correct: 0 };
      result.push({
        date: dateStr,
        label,
        total: entry.total,
        correct: entry.correct,
      });
    }

    return result;
  }

  /**
   * ユーザーネームの変更
   */
  static updateUsername(name: string): UserProfile {
    const profile = this.getProfile();
    profile.username = name.trim() || '探求者';
    this.saveProfile(profile);
    return profile;
  }
}
