// Curated authentic cultural photography downloaded locally in codebase
export const CATEGORY_COVERS: Record<string, string> = {
  LULLABY: '/images/categories/lullaby.jpg', // Traditional Indian family & cradle setting
  FESTIVAL: '/images/categories/festival.jpg', // Authentic Indian festive lamps & celebrations
  CRAFT_TECHNIQUE: '/images/categories/craft.jpg', // Master handloom silk weaving
  STORY: '/images/categories/story.jpg', // Traditional Indian oral storytelling & village heritage
  PROVERB: '/images/categories/proverb.jpg', // Ancient manuscripts & historic scrolls
  RECIPE: '/images/categories/recipe.jpg', // Traditional Indian spices, mortar & pestle
  RITUAL: '/images/categories/ritual.jpg', // Sacred ceremonial brass diya lamps & offerings
  LIFE_SKILL: '/images/categories/life_skill.jpg', // Indigenous knowledge, rural agriculture & heritage skills
  OTHER: '/images/categories/other.jpg', // Indian heritage architecture
};

// Known placeholder image that must never be shown (orange notebook / folder photo)
const BANNED_IMAGE_SNIPPETS = [
  'photo-1544717305-2782549b5136',
  'unsplash.com/photo-1544717305',
];

/**
 * Returns an authentic category cover image.
 * If existingThumbnail is provided and is NOT the generic orange folder photo, it uses it.
 * Otherwise, it reliably falls back to the curated category photograph.
 */
export function getCategoryCover(category?: string | null, existingThumbnail?: string | null): string {
  const normCategory = (category || 'OTHER').toUpperCase().trim();
  const fallback = CATEGORY_COVERS[normCategory] || CATEGORY_COVERS.OTHER;

  if (!existingThumbnail || typeof existingThumbnail !== 'string' || existingThumbnail.trim() === '') {
    return fallback;
  }

  // Check if it's the banned generic orange notebook stock photo
  for (const banned of BANNED_IMAGE_SNIPPETS) {
    if (existingThumbnail.includes(banned)) {
      return fallback;
    }
  }

  return existingThumbnail;
}
