'use client';

import { UserProfile, UserProgressItem, Badge } from '@/types';
import { SRSEngine } from '@/lib/srs/srsEngine';
import { BADGES } from '@/data/badges';

const STORAGE_KEYS = {
  PROFILE: 'kokyo_user_profile',
  PROGRESS: 'kokyo_user_progress_map',
  SOUND_MUTED: 'kokyo_sound_muted',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user_1',
  username: '探求者',
  xp: 0,
  level: 1,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedBadgeIds: [],
  isGuest: true,
  totalAnswered: 0,
  totalCorrect: 0,
  totalStudyTimeSeconds: 0,
  dailyCounts: {},
};

export class UserDataStore {
  static getProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) {
        this.saveProfile(DEFAULT_PROFILE);
        return DEFAULT_PROFILE;
      }
      const profile: UserProfile = JSON.parse(data);

      // 連続ログイン日数の計算
      const today = new Date().toISOString().split('T')[0];
      if (profile.lastActiveDate !== today) {
        const last = new Date(profile.lastActiveDate);
        const now = new Date(today);
        const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          profile.streakDays += 1;
        } else if (diffDays > 1) {
          profile.streakDays = 1;
        }
        profile.lastActiveDate = today;
        this.saveProfile(profile);
      }

      if (profile.totalStudyTimeSeconds === undefined) {
        profile.totalStudyTimeSeconds = 0;
      }

      return profile;
    } catch (e) {
      console.error('Failed to load profile from localStorage:', e);
      return DEFAULT_PROFILE;
    }
  }

  static saveProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      window.dispatchEvent(new Event('user_profile_updated'));
    } catch (e) {
      console.error('Failed to save profile to localStorage:', e);
    }
  }

  static getProgressMap(): Record<string, UserProgressItem> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to load progress from localStorage:', e);
      return {};
    }
  }

  static saveProgressMap(map: Record<string, UserProgressItem>): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(map));
  }

  /**
   * 1問解答時の総合データ更新処理（日別カウント加算 ＆ 学習時間記録付き）
   */
  static recordAnswer(
    questionId: string,
    isCorrect: boolean,
    rating?: number,
    elapsedSeconds: number = 2
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

    // 学習時間の加算（安全のため1問あたり最大60秒にクリップ）
    const validSec = Math.min(Math.max(Math.round(elapsedSeconds), 1), 60);
    profile.totalStudyTimeSeconds = (profile.totalStudyTimeSeconds || 0) + validSec;

    // 日別カウントの加算
    if (!profile.dailyCounts) {
      profile.dailyCounts = {};
    }
    if (!profile.dailyCounts[today]) {
      profile.dailyCounts[today] = { total: 0, correct: 0, studyTimeSeconds: 0 };
    }
    profile.dailyCounts[today].total += 1;
    profile.dailyCounts[today].studyTimeSeconds = (profile.dailyCounts[today].studyTimeSeconds || 0) + validSec;
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
   * 過去 N 日間（または全期間）の日別学習履歴を取得（折れ線グラフ用）
   */
  static getDailyHistory(days: number = 7): { date: string; label: string; total: number; correct: number; studyTimeSeconds: number }[] {
    const profile = this.getProfile();
    const counts = profile.dailyCounts || {};
    const result: { date: string; label: string; total: number; correct: number; studyTimeSeconds: number }[] = [];

    const now = new Date();

    if (days >= 999 || days <= 0) {
      // 全期間
      const storedDates = Object.keys(counts).sort();
      let targetDays = 7;
      if (storedDates.length > 0) {
        const oldest = new Date(storedDates[0]);
        const diffDays = Math.ceil((now.getTime() - oldest.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        targetDays = Math.max(diffDays, 7);
      }

      for (let i = targetDays - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const label = `${month}/${day}`;

        const entry = counts[dateStr] || { total: 0, correct: 0, studyTimeSeconds: 0 };
        result.push({
          date: dateStr,
          label,
          total: entry.total,
          correct: entry.correct,
          studyTimeSeconds: entry.studyTimeSeconds || 0,
        });
      }
    } else {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const label = `${month}/${day}`;

        const entry = counts[dateStr] || { total: 0, correct: 0, studyTimeSeconds: 0 };
        result.push({
          date: dateStr,
          label,
          total: entry.total,
          correct: entry.correct,
          studyTimeSeconds: entry.studyTimeSeconds || 0,
        });
      }
    }

    return result;
  }

  /**
   * 秒数を「〇時間〇分」または「〇分〇秒」に整形
   */
  static formatStudyTime(seconds: number = 0): string {
    if (!seconds || seconds <= 0) return '0分';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}時間${mins}分`;
    }
    if (mins > 0) {
      return `${mins}分${secs}秒`;
    }
    return `${secs}秒`;
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
