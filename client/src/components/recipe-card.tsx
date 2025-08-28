import { GripVertical } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  isDragDisabled?: boolean;
}

export default function RecipeCard({ recipe, onClick, isDragDisabled }: RecipeCardProps) {
  return (
    <div
      className="recipe-card"
      onClick={() => onClick(recipe)}
      data-testid={`card-recipe-${recipe.id}`}
    >
      <div className="p-4 h-full flex flex-col">
        {!isDragDisabled && (
          <div className="drag-handle" data-testid={`drag-handle-${recipe.id}`}>
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid={`text-recipe-title-${recipe.id}`}>
          {recipe.title}
        </h3>
        <p className="text-muted-foreground text-sm flex-1 line-clamp-4" data-testid={`text-recipe-description-${recipe.id}`}>
          {recipe.description}
        </p>
        <div className="mt-auto pt-2">
          {recipe.category && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded" data-testid={`badge-category-${recipe.id}`}>
              {recipe.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
