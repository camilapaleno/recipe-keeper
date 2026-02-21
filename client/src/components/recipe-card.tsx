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

// Generate a consistent random rotation based on recipe ID
function getRotationFromId(id: string): number {
  // Simple hash that spreads out sequential values
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Use sine to spread values and convert to a number between -2.5 and 2.5 degrees
  const rotation = Math.sin(hash) * 2.5;
  return rotation;
}

// Pick one of 4 overlay PNGs based on recipe ID
function getOverlayFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 7) - hash);
  }
  const index = (Math.abs(hash) % 4) + 1;
  return `${import.meta.env.BASE_URL}assets/overlay-${index}.png`;
}

// Generate consistent random offsets based on recipe ID
function getOffsetsFromId(id: string): { x: number; y: number } {
  let hashX = 0;
  let hashY = 0;

  for (let i = 0; i < id.length; i++) {
    hashX = id.charCodeAt(i) + ((hashX << 5) - hashX);
    hashY = id.charCodeAt(i) + ((hashY << 3) - hashY); // Different shift for Y
  }

  // Use sine and cosine to get different spreads, range -10 to 10 pixels
  const x = Math.sin(hashX) * 10;
  const y = Math.cos(hashY) * 10;

  return { x, y };
}

export default function RecipeCard({ recipe, onClick, isDragDisabled, onDragStart, onDragEnd }: RecipeCardProps) {
  const backgroundColor = getColorFromRecipe(recipe, 0);
  const rotation = getRotationFromId(recipe.id);
  const offsets = getOffsetsFromId(recipe.id);
  
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

  const renderLinePattern = () => {
    const pattern = recipe.linePattern || "horizontal";

    switch (pattern) {
      case "horizontal":
        // Current style - 6 lines with normal spacing
        return (
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
        );

      case "horizontal-narrow":
        // More lines with less separation
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{
                  top: `${((i + 1) * 100) / 13}%`,
                }}
              />
            ))}
          </div>
        );

      case "grid":
        // Grid pattern - horizontal and vertical lines
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal lines */}
            {[...Array(6)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{
                  top: `${((i + 1) * 100) / 7}%`,
                }}
              />
            ))}
            {/* Vertical lines */}
            {[...Array(6)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-[0.5px] bg-blue-600 bg-opacity-25"
                style={{
                  left: `${((i + 1) * 100) / 7}%`,
                }}
              />
            ))}
          </div>
        );

      case "none":
        // No lines
        return null;

      default:
        return null;
    }
  };

  return (
    <div
      className="recipe-card"
      style={{
        backgroundColor,
        transform: `translate(${offsets.x}px, ${offsets.y}px) rotate(${rotation}deg)`,
        '--card-rotation': `${rotation}deg`,
        '--card-offset-x': `${offsets.x}px`,
        '--card-offset-y': `${offsets.y}px`
      } as React.CSSProperties & { '--card-rotation': string; '--card-offset-x': string; '--card-offset-y': string }}
      onClick={() => onClick(recipe)}
      data-testid={`card-recipe-${recipe.id}`}
    >
      {/* Overlay texture */}
      <img
        src={getOverlayFromId(recipe.id)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Background lines */}
      {renderLinePattern()}

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
        <h3 className="recipe-title font-semibold text-3xl mb-2 line-clamp-2 lowercase opacity-60" data-testid={`text-recipe-title-${recipe.id}`}>
          {recipe.title}
        </h3>
        
        <p className="recipe-description text-muted-foreground text-m flex-1 line-clamp-4" data-testid={`text-recipe-description-${recipe.id}`}>
          {recipe.description}
        </p>
        
        {/* <div className="mt-auto pt-2">
          {recipe.category && (
            <span className="text-xs bg-muted px-2 py-1 rounded" data-testid={`badge-category-${recipe.id}`}>
              {recipe.category}
            </span>
          )}
        </div> */}
        
        {/* Recipe Image */}
        {recipe.image && (
          <div className="absolute bottom-3 right-3 w-1/2 aspect-square">
            <img 
              src={recipe.image} 
              alt={recipe.title}
              className="w-full h-full object-cover shadow-md transform rotate-3"
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