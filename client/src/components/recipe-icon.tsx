import type { Recipe } from "@/lib/recipes";
import { getColorFromRecipe } from "@/lib/colors";

interface RecipeIconProps {
  recipe: Recipe;
  size?: "sm" | "md";
}

// A tiny paper swatch in the recipe's card color, used to tag grocery items.
export default function RecipeIcon({ recipe, size = "sm" }: RecipeIconProps) {
  // Stable per-recipe tilt so icons look hand-placed, like the cards.
  const tilt = ((recipe.id.charCodeAt(recipe.id.length - 1) % 5) - 2) * 2;

  return (
    <span
      className={`recipe-icon ${size === "md" ? "w-8 h-8 text-lg" : "w-6 h-6 text-sm"}`}
      style={{ backgroundColor: getColorFromRecipe(recipe, 0), transform: `rotate(${tilt}deg)` }}
      title={recipe.title}
      aria-label={recipe.title}
      role="img"
    >
      {recipe.icon || (
        <span className="recipe-title opacity-70">{recipe.title.charAt(0).toLowerCase()}</span>
      )}
    </span>
  );
}
