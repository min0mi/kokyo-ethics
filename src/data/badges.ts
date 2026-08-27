import { Badge } from '@/types';

export const BADGES: Badge[] = [
  // 回答数バッジ
  {
    id: 'first_step',
    name: '知への第一歩',
    description: '初めて問題を1問解いた',
    icon: 'Sparkles',
    category: 'total_answers',
    targetValue: 1,
  },
  {
    id: 'answered_50',
    name: '思索の深まり',
    description: '通算50問の問題に解答した',
    icon: 'Flame',
    category: 'total_answers',
    targetValue: 50,
  },
  {
    id: 'answered_100',
    name: '百問踏破の哲人',
    description: '通算100問の問題に解答した',
    icon: 'Award',
    category: 'total_answers',
    targetValue: 100,
  },
  {
    id: 'answered_300',
    name: '知の求道者',
    description: '通算300問の問題に解答した',
    icon: 'Crown',
    category: 'total_answers',
    targetValue: 300,
  },

  // ストリーク（連続日数）
  {
    id: 'streak_3',
    name: '3日連続達成',
    description: '3日連続で学習を継続した',
    icon: 'Flame',
    category: 'streak',
    targetValue: 3,
  },
  {
    id: 'streak_7',
    name: '週間習慣化（7日）',
    description: '7日連続で学習を継続した',
    icon: 'Zap',
    category: 'streak',
    targetValue: 7,
  },
  {
    id: 'streak_30',
    name: '月間継続（30日）',
    description: '30日連続で学習を継続した',
    icon: 'Trophy',
    category: 'streak',
    targetValue: 30,
  },

  // モード別・源流思想
  {
    id: 'speed_perfect_10',
    name: 'スピード満点クリア',
    description: 'スピード演習で10問全問正解を達成',
    icon: 'Gauge',
    category: 'speed',
    targetValue: 10,
  },
  {
    id: 'master_greek',
    name: '古代ギリシャの賢者',
    description: '古代ギリシャ分野の問題を15問以上マスターした',
    icon: 'Landmark',
    category: 'category_clear',
    targetValue: 15,
  },
  {
    id: 'master_chinese',
    name: '諸子百家の大家',
    description: '中国思想分野の問題を15問以上マスターした',
    icon: 'Scroll',
    category: 'category_clear',
    targetValue: 15,
  },
  {
    id: 'book_scholar',
    name: '原典・古典の理解者',
    description: '著書・文献問題を累計20問正解した',
    icon: 'BookOpen',
    category: 'total_answers',
    targetValue: 20,
  },
  {
    id: 'matching_expert',
    name: '相関関係の達人',
    description: '線つなぎマッチング問題を5回パーフェクトクリアした',
    icon: 'Network',
    category: 'mastery',
    targetValue: 5,
  },
  {
    id: 'typing_master',
    name: '正確な用字記述者',
    description: 'キーワード記述問題をノーミスで10問正解した',
    icon: 'Edit3',
    category: 'mastery',
    targetValue: 10,
  },
];
