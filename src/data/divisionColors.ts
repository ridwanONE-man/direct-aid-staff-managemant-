import type { CSSProperties } from 'react';
import { SchoolDivisionCategory } from '../types';

// Card colours for divisions. Each division keeps one (saved on the division), and its staff cards use the same one.
// A colour is either a preset key below or a custom hex value such as "#7A3E9D".
export interface DivisionColor {
  key: string;
  label: string;
  swatch: string;            // solid colour for dots, rings and icons
  band: string;              // gradient classes for card bands (presets)
  bandStyle?: CSSProperties; // inline gradient (custom colours)
}

export const DIVISION_COLORS: DivisionColor[] = [
  { key: 'green', label: 'DirectAid Green', swatch: '#147D4A', band: 'from-[#0B4F2E] via-[#0E6139] to-[#147D4A]' },
  { key: 'emerald', label: 'Emerald', swatch: '#2D9A48', band: 'from-[#147D4A] via-[#2D9A48] to-[#35B86B]' },
  { key: 'teal', label: 'Teal', swatch: '#13838C', band: 'from-[#0F6A73] via-[#13838C] to-[#1FA2A8]' },
  { key: 'ocean', label: 'Ocean Blue', swatch: '#2563A8', band: 'from-[#1E4E8C] via-[#2563A8] to-[#3B82C4]' },
  { key: 'indigo', label: 'Indigo', swatch: '#4F46E5', band: 'from-[#312E81] via-[#4338CA] to-[#6366F1]' },
  { key: 'plum', label: 'Plum', swatch: '#86398A', band: 'from-[#5B2560] via-[#86398A] to-[#A24DA6]' },
  { key: 'rose', label: 'Rose', swatch: '#BE2B5A', band: 'from-[#8E1A40] via-[#BE2B5A] to-[#DB4B74]' },
  { key: 'amber', label: 'Amber', swatch: '#B7791F', band: 'from-[#8A5A10] via-[#B7791F] to-[#D69E2E]' },
  { key: 'copper', label: 'Copper', swatch: '#C2410C', band: 'from-[#8A2E0B] via-[#C2410C] to-[#EA580C]' },
  { key: 'slate', label: 'Slate', swatch: '#3E6464', band: 'from-[#243D3D] via-[#3E6464] to-[#557D7D]' }
];

export const isCustomColor = (value?: string): value is string => !!value && /^#[0-9a-f]{6}$/i.test(value);

// Blend a hex colour toward black (amount < 0) or white (amount > 0)
const shade = (hex: string, amount: number) => {
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return `#${channels.map(c => Math.round(c + (target - c) * t).toString(16).padStart(2, '0')).join('')}`;
};

// A custom colour gets the same dark-to-light gradient as the presets
export const customDivisionColor = (hex: string): DivisionColor => ({
  key: hex.toLowerCase(),
  label: 'Custom colour',
  swatch: hex,
  band: '',
  bandStyle: { backgroundImage: `linear-gradient(135deg, ${shade(hex, -0.35)} 0%, ${hex} 55%, ${shade(hex, 0.22)} 100%)` }
});

// The division's saved colour; older divisions without one get a steady colour from their number
export const divisionColor = (div: Pick<SchoolDivisionCategory, 'color' | 'canonicalIndex'>): DivisionColor => {
  if (isCustomColor(div.color)) return customDivisionColor(div.color);
  return (
    DIVISION_COLORS.find(c => c.key === div.color) ??
    DIVISION_COLORS[(Math.max(div.canonicalIndex, 1) - 1) % DIVISION_COLORS.length]
  );
};

// First colour no division uses yet, so each new division looks different
export const nextDivisionColor = (divisions: SchoolDivisionCategory[]): string => {
  const used = new Set(divisions.map(d => divisionColor(d).key));
  return (DIVISION_COLORS.find(c => !used.has(c.key)) ?? DIVISION_COLORS[divisions.length % DIVISION_COLORS.length]).key;
};
