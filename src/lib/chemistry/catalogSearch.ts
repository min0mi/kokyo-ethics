import { KEYWORDS } from '@/data/chemistry/keywords';
import { FIGURES } from '@/data/chemistry/figures';
import { COLOR_ALIASES } from '@/data/chemistry/chemistryReference';

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/−/g, '-').replace(/\^/g, '')
  .replace(/[\u3041-\u3096]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));

export function searchCatalog(query: string, tag = '', phase = '') {
  const normalized = normalize(query.trim());
  const alias = Object.entries(COLOR_ALIASES).find(([name]) => normalize(name) === normalized)?.[1];
  const exactColor = FIGURES.find((color) => normalize(color.name) === normalize(alias || query.trim()));
  if (normalized.endsWith('色') && !exactColor) return [];
  return KEYWORDS.filter((kw) => {
    if (tag === '__untagged' ? !!kw.tags?.length : tag && !kw.tags?.includes(tag)) return false;
    if (phase && kw.phase !== phase) return false;
    // A full color name selects that color, not substances whose notes mention it.
    if (exactColor) return kw.figureId === exactColor.id;
    const color = FIGURES.find((figure) => figure.id === kw.figureId);
    return normalize([kw.name, kw.formula, color?.name, kw.definition, ...(kw.tags || [])].join(' ')).includes(normalized);
  });
}
