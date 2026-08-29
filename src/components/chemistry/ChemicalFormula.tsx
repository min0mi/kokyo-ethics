import React from 'react';
import { KEYWORDS } from '@/data/chemistry/keywords';
import { SUBSTANCE_FORMULAS } from '@/data/chemistry/chemistryReference';

/** Explicit ^ charge syntax avoids misreading NH4+ as N H^(4+). */
export function ChemicalFormula({ formula }: { formula: string }) {
  const chargeAt = formula.indexOf('^');
  const body = chargeAt < 0 ? formula : formula.slice(0, chargeAt);
  const charge = chargeAt < 0 ? '' : formula.slice(chargeAt + 1);
  const parts = body.split(/(\d+)/);
  return (
    <span className="chemical-formula whitespace-nowrap font-medium" aria-label={formula.replace('^', ' ')}>
      {parts.map((part, index) => /^\d+$/.test(part) && index > 0 && !/[·.]$/.test(parts[index - 1])
        ? <sub key={index}>{part}</sub> : <React.Fragment key={index}>{part}</React.Fragment>)}
      {charge && <sup>{charge.replace('-', '−')}</sup>}
    </span>
  );
}

/** Equations use spaces between species; the coefficient stays on the baseline. */
export function ChemicalEquation({ equation }: { equation: string }) {
  return <span className="leading-loose">{equation.split(/(\s+)/).map((token, index) => {
    const match = token.match(/^(\d+)?([A-Z[(][A-Za-z0-9()[\].·]*(?:\^\d*[+-])?)(↓)?$/);
    return match ? <React.Fragment key={index}>{match[1]}<ChemicalFormula formula={match[2]} />{match[3]}</React.Fragment> : token;
  })}</span>;
}

const labels = new Map(KEYWORDS.map((keyword) => {
  const name = keyword.baseName || keyword.name.replace(/ \(.*\)$/, '');
  const formula = keyword.formula || SUBSTANCE_FORMULAS[name];
  return [keyword.name, { name, formula }] as const;
}));
const labelPattern = new RegExp(`(${Array.from(labels.keys()).sort((a, b) => b.length - a.length)
  .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

/** Render presentation only; raw answer strings and IDs remain unchanged. */
export function ChemicalText({ text }: { text: string }) {
  return <>{text.split(labelPattern).map((part, index) => {
    const label = labels.get(part);
    return label?.formula ? <ChemicalFormula key={index} formula={label.formula} /> : part;
  })}</>;
}
