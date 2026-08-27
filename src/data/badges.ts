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
    name: '三日坊主脱出！',
    description: '3日連続で学習を継続した',
    icon: 'Flame',
    category: 'streak',
    targetValue: 3,
  },
  {
    id: 'streak_7',
    name: '習慣化マスター（1週間）',
    description: '7日連続で学習を継続した',
    icon: 'Zap',
    category: 'streak',
    targetValue: 7,
  },
  {
    id: 'streak_30',
    name: '不屈の魂（1ヶ月継続）',
    description: '30日連続で学習を継続した',
    icon: 'Trophy',
    category: 'streak',
    targetValue: 30,
  },

  // モード別・正答率
  {
    id: 'speed_perfect_10',
    name: '電光石火（ノーミスクリア）',
    description: 'スピード暗記モードで10問連続全問正解を達成',
    icon: 'Gauge',
    category: 'speed',
    targetValue: 10,
  },
  {
    id: 'master_greek',
    name: 'ギリシャ哲学の賢者',
    description: '古代ギリシャ分野の問題を15問以上マスターした',
    icon: 'Landmark',
    category: 'category_clear',
    targetValue: 15,
  },
  {
    id: 'master_modern',
    name: '近代理性の解明者',
    description: '西洋近代・ドイツ観念論の問題を20問以上マスターした',
    icon: 'Compass',
    category: 'category_clear',
    targetValue: 20,
  },
  {
    id: 'book_scholar',
    name: '博覧強記の書誌学者',
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
    name: '一言一句の記述王',
    description: 'キーワード記述問題をノーミスで10問正解した',
    icon: 'Edit3',
    category: 'mastery',
    targetValue: 10,
  },
];

