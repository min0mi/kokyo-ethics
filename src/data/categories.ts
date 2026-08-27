import { Category } from '@/types';

export interface ExtendedCategory extends Category {
  isAvailable: boolean;
  groupName: '源流思想' | '日本思想' | '西洋思想';
}

export const CATEGORIES: ExtendedCategory[] = [
  // 1. 源流思想
  {
    id: 'greek',
    name: '古代ギリシャ哲学',
    shortName: '古代ギリシャ',
    era: '前6世紀〜前4世紀',
    description: '自然哲学（アルケー）、ソフィスト、ソクラテス・プラトン・アリストテレス、ヘレニズム思想（エピクロス・ゼノン）',
    iconName: 'Landmark',
    orderIndex: 1,
    isAvailable: true,
    groupName: '源流思想',
  },
  {
    id: 'hebrew_christian',
    name: 'ユダヤ教・キリスト教',
    shortName: 'ユダヤ・キリスト教',
    era: '前13世紀〜中世',
    description: '一神教、十戒、イエスの愛（アガペー・隣人愛）、パウロと信仰義認、教父・スコラ哲学',
    iconName: 'Cross',
    orderIndex: 2,
    isAvailable: true,
    groupName: '源流思想',
  },
  {
    id: 'islam',
    name: 'イスラーム',
    shortName: 'イスラーム',
    era: '7世紀〜',
    description: 'ムハンマドの啓示、アッラーへの帰依、六信五行、コーランとイブン・ルシュド',
    iconName: 'Moon',
    orderIndex: 3,
    isAvailable: true,
    groupName: '源流思想',
  },
  {
    id: 'indian_buddhism',
    name: '古代インド・仏教',
    shortName: 'インド・仏教',
    era: '前6世紀〜',
    description: 'ゴータマ・シッダールタ（四諦八正道・縁起の法）、大乗仏教（空の思想・唯識思想）',
    iconName: 'Flower2',
    orderIndex: 4,
    isAvailable: true,
    groupName: '源流思想',
  },
  {
    id: 'chinese_philosophy',
    name: '中国思想（諸子百家・宋明理学）',
    shortName: '中国思想',
    era: '春秋戦国時代〜近世',
    description: '儒家（孔子・孟子・荀子）、道家（老子・荘子）、墨家、法家、朱子学・陽明学',
    iconName: 'Scroll',
    orderIndex: 5,
    isAvailable: true,
    groupName: '源流思想',
  },
  {
    id: 'adolescence_public',
    name: '青年期の課題と人間観',
    shortName: '青年期・自己形成',
    era: '心理・人間論',
    description: 'ホモ・サピエンス/ルーデンス、アイデンティティ（エリクソン）、欲求階層（マズロー）、葛藤・パーソナリティ理論',
    iconName: 'Users',
    orderIndex: 6,
    isAvailable: true,
    groupName: '源流思想',
  },

  // 2. 日本思想 (〜鎌倉 と 室町〜 に分割)
  {
    id: 'japan_ancient_kamakura',
    name: '日本思想（古代〜鎌倉）',
    shortName: '日本思想（〜鎌倉）',
    era: '古代〜鎌倉時代',
    description: '聖徳太子、奈良・平安仏教（最澄・空海・源信・空也）、鎌倉新仏教（法然・親鸞・一遍・栄西・道元・日蓮・明恵）',
    iconName: 'Torii',
    orderIndex: 7,
    isAvailable: true,
    groupName: '日本思想',
  },
  {
    id: 'japan_muromachi_modern',
    name: '日本思想（室町〜近代・現代）',
    shortName: '日本思想（室町〜）',
    era: '室町時代〜現代',
    description: '室町文化、江戸儒学・国学・町人農民思想、幕末・近代啓蒙思想（福沢諭吉・中江兆民）、京都学派（西田幾多郎）、民俗学',
    iconName: 'BookOpen',
    orderIndex: 8,
    isAvailable: true,
    groupName: '日本思想',
  },

  // 3. 西洋思想
  {
    id: 'western_modern',
    name: '西洋近代思想（ルネサンス〜功利・社会主義）',
    shortName: '西洋近代思想',
    era: '14世紀〜19世紀',
    description: 'ルネサンス、宗教改革、近代合理論・経験論、社会契約説、啓蒙思想、ドイツ観念論、功利主義、社会主義',
    iconName: 'Compass',
    orderIndex: 9,
    isAvailable: true,
    groupName: '西洋思想',
  },
  {
    id: 'western_contemporary',
    name: '西洋現代思想（実存〜現代正義・環境倫理）',
    shortName: '西洋現代思想',
    era: '19世紀末〜現代',
    description: '実存主義、プラグマティズム、精神分析、フランクフルト学派、構造主義・ポスト構造主義、正義論、環境倫理・生命倫理',
    iconName: 'Flame',
    orderIndex: 10,
    isAvailable: true,
    groupName: '西洋思想',
  },
];
