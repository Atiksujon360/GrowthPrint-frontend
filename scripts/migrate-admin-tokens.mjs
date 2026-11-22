// One-off codemod: migrate legacy utility classes in Studio/Ops views to gp-* tokens.
// Replaces whole utility tokens (variant prefixes like hover: are preserved automatically
// because we match the utility portion after the last ':').
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync('git ls-files "features/admin/**/*.tsx"', { encoding: 'utf8' })
  .split('\n').filter(Boolean);

// Ordered: more specific patterns first.
const MAP = [
  // surfaces
  [/\bbg-white\b/g, 'bg-gp-surface'],
  [/\bbg-slate-50\/50\b/g, 'bg-gp-surface-secondary/50'],
  [/\bbg-slate-50\b/g, 'bg-gp-canvas'],
  [/\bbg-slate-100\b/g, 'bg-gp-surface-secondary'],
  [/\bbg-slate-200\b/g, 'bg-gp-border'],
  [/\bbg-slate-800\b/g, 'bg-gp-primary-hover'],
  [/\bbg-slate-900\b/g, 'bg-gp-primary'],
  [/\bbg-slate-700\b/g, 'bg-gp-surface-elevated'],
  [/\bbg-ink-50\b/g, 'bg-gp-canvas'],
  [/\bbg-ink-100\b/g, 'bg-gp-surface-secondary'],
  [/\bbg-ink-200\b/g, 'bg-gp-border'],
  [/\bbg-gray-50\b/g, 'bg-gp-canvas'],
  [/\bbg-gray-100\b/g, 'bg-gp-surface-secondary'],
  // text
  [/\btext-slate-950\b/g, 'text-gp-text'],
  [/\btext-slate-900\b/g, 'text-gp-text'],
  [/\btext-slate-800\b/g, 'text-gp-text'],
  [/\btext-slate-700\b/g, 'text-gp-text'],
  [/\btext-slate-600\b/g, 'text-gp-text-secondary'],
  [/\btext-slate-500\b/g, 'text-gp-text-muted'],
  [/\btext-slate-400\b/g, 'text-gp-text-muted'],
  [/\btext-ink-950\b/g, 'text-gp-text'],
  [/\btext-ink-900\b/g, 'text-gp-text'],
  [/\btext-ink-800\b/g, 'text-gp-text'],
  [/\btext-ink-700\b/g, 'text-gp-text-secondary'],
  [/\btext-ink-600\b/g, 'text-gp-text-secondary'],
  [/\btext-ink-500\b/g, 'text-gp-text-muted'],
  [/\btext-gray-900\b/g, 'text-gp-text'],
  [/\btext-gray-600\b/g, 'text-gp-text-secondary'],
  [/\btext-gray-500\b/g, 'text-gp-text-muted'],
  // borders / dividers
  [/\bborder-slate-300\b/g, 'border-gp-border'],
  [/\bborder-slate-200\b/g, 'border-gp-border'],
  [/\bborder-slate-100\b/g, 'border-gp-divider'],
  [/\bborder-ink-200\b/g, 'border-gp-border'],
  [/\bborder-ink-100\b/g, 'border-gp-divider'],
  [/\bdivide-slate-100\b/g, 'divide-gp-divider'],
  [/\bdivide-slate-200\b/g, 'divide-gp-divider'],
  [/\bring-slate-200\b/g, 'ring-gp-border'],
  // accents: blue → primary
  [/\bbg-blue-50\b/g, 'bg-gp-primary-soft'],
  [/\bbg-blue-100\b/g, 'bg-gp-primary-soft'],
  [/\btext-blue-700\b/g, 'text-gp-primary-strong'],
  [/\btext-blue-600\b/g, 'text-gp-primary-strong'],
  [/\btext-blue-500\b/g, 'text-gp-primary'],
  [/\bborder-blue-200\b/g, 'border-gp-primary/30'],
  [/\bborder-blue-100\b/g, 'border-gp-primary/20'],
  [/\bring-blue-200\b/g, 'ring-gp-primary/30'],
  // semantics
  [/\bbg-emerald-50\b/g, 'bg-gp-success-soft'],
  [/\bbg-emerald-100\b/g, 'bg-gp-success-soft'],
  [/\btext-emerald-700\b/g, 'text-gp-success'],
  [/\btext-emerald-800\b/g, 'text-gp-success'],
  [/\bborder-emerald-200\b/g, 'border-gp-success/30'],
  [/\bbg-green-50\b/g, 'bg-gp-success-soft'],
  [/\btext-green-700\b/g, 'text-gp-success'],
  [/\btext-green-600\b/g, 'text-gp-success'],
  [/\bbg-red-50\b/g, 'bg-gp-danger-soft'],
  [/\bbg-red-100\b/g, 'bg-gp-danger-soft'],
  [/\btext-red-700\b/g, 'text-gp-danger'],
  [/\btext-red-600\b/g, 'text-gp-danger'],
  [/\btext-red-500\b/g, 'text-gp-danger'],
  [/\bborder-red-200\b/g, 'border-gp-danger/30'],
  [/\bbg-rose-50\b/g, 'bg-gp-danger-soft'],
  [/\btext-rose-700\b/g, 'text-gp-danger'],
  [/\bbg-amber-50\b/g, 'bg-gp-warning-soft'],
  [/\bbg-amber-100\b/g, 'bg-gp-warning-soft'],
  [/\btext-amber-800\b/g, 'text-gp-warning'],
  [/\btext-amber-700\b/g, 'text-gp-warning'],
  [/\btext-amber-600\b/g, 'text-gp-warning'],
  [/\bborder-amber-200\b/g, 'border-gp-warning/30'],
  [/\bbg-yellow-50\b/g, 'bg-gp-warning-soft'],
  [/\btext-yellow-700\b/g, 'text-gp-warning'],
  // second pass: interactive accents & icons
  [/\bbg-blue-600\b/g, 'bg-gp-primary'],
  [/\bbg-blue-500\b/g, 'bg-gp-primary'],
  [/\bbg-blue-700\b/g, 'bg-gp-primary-hover'],
  [/\btext-blue-700\b/g, 'text-gp-primary-strong'],
  [/\btext-blue-600\b/g, 'text-gp-primary-strong'],
  [/\btext-blue-500\b/g, 'text-gp-primary'],
  [/\btext-blue-800\b/g, 'text-gp-primary-strong'],
  [/\btext-blue-400\b/g, 'text-gp-primary'],
  [/\bbg-emerald-600\b/g, 'bg-gp-success'],
  [/\bbg-emerald-700\b/g, 'bg-gp-success'],
  [/\btext-emerald-600\b/g, 'text-gp-success'],
  [/\btext-emerald-700\b/g, 'text-gp-success'],
  [/\btext-emerald-900\b/g, 'text-gp-success'],
  [/\bbg-red-600\b/g, 'bg-gp-danger'],
  [/\bbg-red-700\b/g, 'bg-gp-danger'],
  [/\btext-red-900\b/g, 'text-gp-danger'],
  [/\btext-red-800\b/g, 'text-gp-danger'],
  [/\btext-red-700\b/g, 'text-gp-danger'],
  [/\btext-red-600\b/g, 'text-gp-danger'],
  [/\bborder-red-200\b/g, 'border-gp-danger/30'],
  [/\btext-rose-800\b/g, 'text-gp-danger'],
  [/\btext-rose-700\b/g, 'text-gp-danger'],
  [/\btext-rose-500\b/g, 'text-gp-danger'],
  [/\bborder-rose-200\b/g, 'border-gp-danger/30'],
  [/\bbg-rose-100\b/g, 'bg-gp-danger-soft'],
  [/\bbg-violet-50\b/g, 'bg-gp-primary-soft'],
  [/\bborder-violet-200\b/g, 'border-gp-primary/30'],
  [/\btext-violet-800\b/g, 'text-gp-primary-strong'],
  [/\btext-violet-700\b/g, 'text-gp-primary-strong'],
  [/\btext-violet-500\b/g, 'text-gp-primary'],
  [/\btext-amber-500\b/g, 'text-gp-warning'],
  [/\btext-slate-300\b/g, 'text-gp-text-muted'],
];

let total = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  const before = src;
  for (const [re, rep] of MAP) src = src.replace(re, rep);
  // second pass: catch bg-slate-900 buttons that lost text-white pairing — handled manually if needed
  if (src !== before) {
    writeFileSync(file, src);
    total++;
    console.log('updated', file);
  }
}
console.log(`done: ${total} files`);
