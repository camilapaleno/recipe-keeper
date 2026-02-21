export const RECIPE_COLORS = [
  '#fed07d', // Light orange
  '#abd6e8', // Light blue
  '#efe5b9', // Light yellow
  '#f4f5f6', // White
  '#e7f19a', // Light green
] as const;

export function getNextColor(existingRecipes: any[]): string {
  // Count existing recipes to determine next color index
  const nextIndex = existingRecipes.length % RECIPE_COLORS.length;
  return RECIPE_COLORS[nextIndex];
}

export function getColorFromRecipe(recipe: { color?: string; id?: string }, fallbackIndex: number = 0): string {
  // If recipe has a color, use it; otherwise use fallback
  if (recipe.color && RECIPE_COLORS.includes(recipe.color as any)) {
    return recipe.color;
  }
  
  // If no color but has ID, use ID hash for consistent color assignment
  if (recipe.id) {
    const hash = recipe.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const colorIndex = Math.abs(hash) % RECIPE_COLORS.length;
    return RECIPE_COLORS[colorIndex];
  }
  
  // Fallback to index-based color
  const colorIndex = fallbackIndex % RECIPE_COLORS.length;
  return RECIPE_COLORS[colorIndex];
}