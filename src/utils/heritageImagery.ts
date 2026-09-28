/**
 * Photography allowlist for hero/discovery surfaces.
 *
 * Several files in /public/images/categories are generic stock placeholders
 * (a game controller, a nightclub crowd, a desk laptop) that misrepresent the
 * archive. Only culturally accurate frames are shown large; every other
 * category falls back to a woven motif tile.
 */
export const VETTED_CATEGORY_PHOTOS: Record<string, string> = {
  RITUAL: '/images/categories/ritual.jpg',
  CRAFT_TECHNIQUE: '/images/categories/craft.jpg',
  RECIPE: '/images/categories/recipe.jpg',
};

export interface MotifTheme {
  from: string;
  via: string;
  to: string;
  accent: string;
}

export const CATEGORY_MOTIFS: Record<string, MotifTheme> = {
  STORY: { from: '#2C1B12', via: '#4A2A17', to: '#1E130D', accent: '#E0A23C' },
  LULLABY: { from: '#141E24', via: '#1F3D3A', to: '#101A1C', accent: '#7FC9B4' },
  FESTIVAL: { from: '#3A1414', via: '#7A2E1C', to: '#25100C', accent: '#F0B24B' },
  PROVERB: { from: '#1C1A28', via: '#332C4C', to: '#14121C', accent: '#C3A8F0' },
  LIFE_SKILL: { from: '#1A2418', via: '#324A2B', to: '#121A11', accent: '#A8CE8C' },
  OTHER: { from: '#221D18', via: '#3A3129', to: '#171310', accent: '#D8C6A5' },
};

export const DEFAULT_MOTIF: MotifTheme = CATEGORY_MOTIFS.OTHER;

export const motifFor = (category: string): MotifTheme => CATEGORY_MOTIFS[category] ?? DEFAULT_MOTIF;
