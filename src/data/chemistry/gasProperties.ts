export type GasProperty = { formula: string; name: string; collection: '上方置換' | '下方置換' | '水上置換'; drying: string[] };
export const GAS_DRYING_AGENTS = ['P₄O₁₀', 'CaCl₂', 'CaO', 'H₂SO₄', 'シリカゲル', 'ソーダ石灰'];
export const GAS_PROPERTIES: GasProperty[] = [
  ['H₂','水素','水上置換',['P₄O₁₀','CaCl₂','H₂SO₄','シリカゲル']],[ 'O₂','酸素','水上置換',['P₄O₁₀','CaCl₂','H₂SO₄','シリカゲル']],[ 'O₃','オゾン','水上置換',['CaCl₂','H₂SO₄','シリカゲル']],[ 'N₂','窒素','水上置換',['P₄O₁₀','CaCl₂','H₂SO₄','シリカゲル']],[ 'Cl₂','塩素','下方置換',['CaCl₂','H₂SO₄']],[ 'HF','フッ化水素','下方置換',['P₄O₁₀']],[ 'HCl','塩化水素・塩酸','下方置換',['P₄O₁₀','H₂SO₄']],[ 'CO','一酸化炭素','水上置換',['P₄O₁₀','CaCl₂','H₂SO₄','シリカゲル']],[ 'CO₂','二酸化炭素','下方置換',['H₂SO₄']],[ 'NH₃','アンモニア','上方置換',['CaO','ソーダ石灰']],[ 'NO','一酸化窒素','水上置換',['P₄O₁₀','CaCl₂','H₂SO₄','シリカゲル']],[ 'NO₂','二酸化窒素','下方置換',['P₄O₁₀','H₂SO₄']],[ 'H₂S','硫化水素','下方置換',['P₄O₁₀','CaCl₂']],[ 'SO₂','二酸化硫黄','下方置換',['P₄O₁₀','CaCl₂']]
].map(([formula,name,collection,drying])=>({formula,name,collection,drying})) as GasProperty[];
