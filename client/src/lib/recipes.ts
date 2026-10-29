import recipeData from "@/data/recipes.json";

// The recipe list is read-only at runtime. To add, edit, or remove a recipe,
// edit client/src/data/recipes.json and push to main to redeploy.
// Recipes render in the order they appear in that file.
export interface Recipe {
  id: string;
  title: string;
  /** Emoji shown on the grocery list. Falls back to the title's first letter. */
  icon?: string;
  description: string;
  category: string;
  color: string;
  linePattern: string;
  /** Either a full URL or a path under client/public, e.g. "assets/recipe-photos/x.jpg". */
  image: string;
  link: string;
  /** One line per ingredient. Lines like "--- Toppings ---" are section headers. */
  ingredients: string[];
  directions: string;
}

export const recipes: Recipe[] = recipeData;

export function getRecipeImageUrl(image: string): string {
  return image.startsWith("assets/") ? import.meta.env.BASE_URL + image : image;
}

export function isSectionHeader(ingredient: string): boolean {
  return /^-{2,}.*-{2,}$/.test(ingredient.trim());
}
