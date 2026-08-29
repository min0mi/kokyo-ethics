import { Category, CategoryId } from '@/types';

export interface ExtendedCategory extends Category { isAvailable: boolean; groupName: string; }
export interface FocusSeries { id: string; name: string; categoryIds: CategoryId[]; }

export const CATEGORIES: ExtendedCategory[] = [
  {
    "id": "cat_halogen",
    "name": "ハロゲン",
    "shortName": "ハロゲン",
    "era": "集中マスター",
    "description": "ハロゲン・ハロゲン化銀シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 1,
    "isAvailable": true,
    "groupName": "ハロゲン・ハロゲン化銀シリーズ"
  },
  {
    "id": "cat_silver_halide",
    "name": "ハロゲン化銀",
    "shortName": "ハロゲン化銀",
    "era": "集中マスター",
    "description": "ハロゲン・ハロゲン化銀シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 2,
    "isAvailable": true,
    "groupName": "ハロゲン・ハロゲン化銀シリーズ"
  },
  {
    "id": "cat_flame",
    "name": "炎色反応",
    "shortName": "炎色反応",
    "era": "集中マスター",
    "description": "炎色反応シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 3,
    "isAvailable": true,
    "groupName": "炎色反応シリーズ"
  },
  {
    "id": "cat_other",
    "name": "酸化物・水酸化物",
    "shortName": "酸化物・水酸化物",
    "era": "集中マスター",
    "description": "酸化物・水酸化物シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 4,
    "isAvailable": true,
    "groupName": "酸化物・水酸化物シリーズ"
  },
  {
    "id": "cat_copper",
    "name": "銅シリーズ",
    "shortName": "銅",
    "era": "集中マスター",
    "description": "重要金属シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 5,
    "isAvailable": true,
    "groupName": "重要金属シリーズ"
  },
  {
    "id": "cat_iron",
    "name": "鉄シリーズ",
    "shortName": "鉄",
    "era": "集中マスター",
    "description": "重要金属シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 6,
    "isAvailable": true,
    "groupName": "重要金属シリーズ"
  },
  {
    "id": "cat_sulfide",
    "name": "硫化物",
    "shortName": "硫化物",
    "era": "集中マスター",
    "description": "重要金属シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 7,
    "isAvailable": true,
    "groupName": "重要金属シリーズ"
  },
  {
    "id": "cat_manganese",
    "name": "マンガン系列",
    "shortName": "マンガン",
    "era": "集中マスター",
    "description": "重要金属シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 8,
    "isAvailable": true,
    "groupName": "重要金属シリーズ"
  },
  {
    "id": "cat_chromate",
    "name": "クロム系列",
    "shortName": "クロム",
    "era": "集中マスター",
    "description": "重要金属シリーズの色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 9,
    "isAvailable": true,
    "groupName": "重要金属シリーズ"
  },
  {
    "id": "cat_precipitate",
    "name": "旧・沈殿分類",
    "shortName": "旧・沈殿",
    "era": "集中マスター",
    "description": "凍結の色暗記データ。",
    "iconName": "Beaker",
    "orderIndex": 10,
    "isAvailable": false,
    "groupName": "凍結"
  }
];

export const FOCUS_SERIES: FocusSeries[] = [
  { id: 'focus_halogen', name: 'ハロゲン・ハロゲン化銀', categoryIds: ['cat_halogen','cat_silver_halide'] },
  { id: 'focus_flame', name: '炎色反応', categoryIds: ['cat_flame'] },
  { id: 'focus_oxide', name: '酸化物・水酸化物', categoryIds: ['cat_other'] },
  { id: 'focus_metals', name: '重要金属', categoryIds: ['cat_copper','cat_iron','cat_sulfide','cat_manganese','cat_chromate'] },
];
