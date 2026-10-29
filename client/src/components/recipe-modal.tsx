import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ExternalLink } from "lucide-react";
import { getColorFromRecipe } from "@/lib/colors";
import { getRecipeImageUrl, type Recipe } from "@/lib/recipes";

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export default function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  useEffect(() => {
    setCheckedIngredients(new Set());
  }, [recipe]);

  const toggleIngredientCheck = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  if (!recipe) return null;

  const backgroundColor = getColorFromRecipe(recipe, 0);

  const renderLinePattern = () => {
    switch (recipe.linePattern || "horizontal") {
      case "horizontal":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ top: `${((i + 1) * 100) / 7}%` }}
              />
            ))}
          </div>
        );
      case "horizontal-narrow":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ top: `${((i + 1) * 100) / 13}%` }}
              />
            ))}
          </div>
        );
      case "grid":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ top: `${((i + 1) * 100) / 7}%` }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ left: `${((i + 1) * 100) / 7}%` }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overlay" onClick={onClose} data-testid="modal-recipe-overlay">
      <div
        className="full-card relative"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor }}
      >
        {renderLinePattern()}
        <div className="p-6 relative z-10 space-y-6">
          {/* Title and Close on same line */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground recipe-title flex-1" data-testid="text-recipe-title">
              {recipe.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Description */}
          {recipe.description && (
            <div className="recipe-description" data-testid="text-recipe-description">
              {recipe.description}
            </div>
          )}

          {/* Ingredients */}
          <div className="space-y-2" data-testid="list-recipe-ingredients">
            {recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <Checkbox
                    checked={checkedIngredients.has(index)}
                    onCheckedChange={() => toggleIngredientCheck(index)}
                    className="w-6 h-6 cursor-pointer"
                    data-testid={`checkbox-ingredient-${index}`}
                  />
                  <span
                    className={`${checkedIngredients.has(index) ? 'line-through opacity-60' : ''}`}
                    data-testid={`text-ingredient-${index}`}
                  >
                    {ingredient}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No ingredients listed</div>
            )}
          </div>

          {/* Directions */}
          {recipe.directions && (
            <div className="leading-relaxed whitespace-pre-line" data-testid="text-recipe-directions">
              {recipe.directions}
            </div>
          )}

          {/* Image */}
          {recipe.image && (
            <div className="w-32 h-32" data-testid="text-recipe-image">
              <img src={getRecipeImageUrl(recipe.image)} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Recipe Link */}
          {recipe.link && (
            <div data-testid="text-recipe-link" className="w-full min-w-0">
              <a
                href={recipe.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-black/15 bg-black/5 text-foreground text-sm hover:bg-black/10 transition-colors no-underline min-w-0"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate min-w-0">{recipe.link}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
