import catalog from './chemistryCatalog.json';

export const SOURCES = catalog.sources;
export type SourceId = keyof typeof SOURCES;
export interface ReviewItem {
  rows: string; name: string; formula?: string; original: string; proposed: string;
  kind: string; reason: string; sources: SourceId[]; resolution: string; status: string;
}
export interface Precipitate {
  id: string; name: string; formula: string; color: string; group: string;
  condition: string; equation: string; after: string; sources: SourceId[]; keywordId: string;
}
export const REVIEW_ITEMS = catalog.reviewItems as ReviewItem[];
export const PRECIPITATES = catalog.precipitates as Precipitate[];
export const ADDITIONS = catalog.additions as {name:string; formula:string; color:string; reason:string; sources:SourceId[]}[];
export const REFERENCE_ITEMS = catalog.records.filter((record) => record.status !== 'active');
export const SUBSTANCE_FORMULAS: Record<string, string> = Object.fromEntries(
  catalog.records.filter((record) => record.status === 'active').map((record) => [record.name, record.formula])
);
export const COLOR_ALIASES: Record<string, string> = catalog.colorAliases;
