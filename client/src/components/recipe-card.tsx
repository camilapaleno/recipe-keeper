import { GripVertical } from "lucide-react";
import type { Recipe } from "@shared/schema";
import { getColorFromRecipe } from "@/lib/colors";

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  isDragDisabled?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export default function RecipeCard({ recipe, onClick, isDragDisabled, onDragStart, onDragEnd }: RecipeCardProps) {
  const backgroundColor = getColorFromRecipe(recipe, 0);
  
  const handleDragClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the recipe when dragging
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      className="recipe-card"
      style={{ backgroundColor }}
      onClick={() => onClick(recipe)}
      data-testid={`card-recipe-${recipe.id}`}
    >
      {/* Background lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
            style={{
              top: `${((i + 1) * 100) / 7}%`,
            }}
          />
        ))}
      </div>

      <div className="p-4 h-full flex flex-col relative z-10">
        {!isDragDisabled && (
          <div 
            className="drag-handle" 
            data-testid={`drag-handle-${recipe.id}`}
            onClick={handleDragClick}
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        <h3 className="recipe-title font-semibold text-lg mb-2 line-clamp-2" data-testid={`text-recipe-title-${recipe.id}`}>
          {recipe.title}
        </h3>
        
        <p className="text-muted-foreground text-sm flex-1 line-clamp-4" data-testid={`text-recipe-description-${recipe.id}`}>
          {recipe.description}
        </p>
        
        <div className="mt-auto pt-2">
          {recipe.category && (
            <span className="text-xs bg-muted px-2 py-1 rounded" data-testid={`badge-category-${recipe.id}`}>
              {recipe.category}
            </span>
          )}
        </div>
        
        {/* Recipe Image */}
        {recipe.image && (
          <div className="absolute bottom-3 right-3 w-1/2 aspect-square">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover rounded-md shadow-md transform rotate-3"
              data-testid={`image-recipe-${recipe.id}`}
            />
            <img 
              src="/assets/paperclip-icon.png" 
              alt="paperclip"
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-5" 
              data-testid={`paperclip-recipe-${recipe.id}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}