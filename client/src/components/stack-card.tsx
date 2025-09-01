import { useState } from "react";
import { GripVertical, Layers, Edit2, Check, X, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStacks } from "@/hooks/use-stacks";
import { useRecipes } from "@/hooks/use-recipes";
import type { Stack } from "@shared/schema";

interface StackCardProps {
  stack: Stack;
  recipeCount: number;
  onClick: (stack: Stack) => void;
  isExpanded?: boolean;
  isDropTarget?: boolean;
  isDragDisabled?: boolean;
  isReordering?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export default function StackCard({ stack, recipeCount, onClick, isExpanded, isDropTarget, isDragDisabled, isReordering, onDragStart, onDragEnd }: StackCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stack.name);
  const { updateStack, deleteStack } = useStacks();
  const { data: recipes = [], updateRecipe } = useRecipes();

  const handleDragClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the stack when dragging
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReordering) {
      setIsEditing(true);
      setEditName(stack.name);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateStack.mutate({
      id: stack.id,
      data: {
        name: editName.trim() || stack.name,
        description: stack.description,
        position: stack.position,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(stack.name);
    setIsEditing(false);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to ungroup "${stack.name}"? All recipes will be moved back to the main page.`)) {
      try {
        // First, move all recipes in this stack back to the main page
        const stackRecipes = recipes.filter(recipe => recipe.stackId === stack.id);
        
        // Update all recipes to remove their stackId
        await Promise.all(
          stackRecipes.map(recipe => 
            updateRecipe.mutateAsync({
              id: recipe.id,
              data: {
                ...recipe,
                stackId: null,
              },
            })
          )
        );
        
        // Then delete the stack
        await deleteStack.mutateAsync(stack.id);
      } catch (error) {
        console.error('Failed to ungroup stack:', error);
      }
    }
  };

  return (
    <div
      className={`stack-card group ${isDropTarget ? 'drop-target' : ''} ${isReordering ? 'reordering' : ''}`}
      onClick={() => !isEditing && !isReordering && onClick(stack)}
      data-testid={`card-stack-${stack.id}`}
    >
      <div className="stack-layer"></div>
      <div className="stack-layer"></div>
      <div className="stack-layer">
        <div className="p-6 h-full flex flex-col items-center justify-center text-center">
          {!isDragDisabled && (
            <div 
              className="drag-handle absolute top-2 right-2 z-10" 
              data-testid={`drag-handle-${stack.id}`}
              onClick={handleDragClick}
              draggable={true}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          
          <button
            onClick={handleDeleteClick}
            className="absolute top-2 left-2 z-10 text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            data-testid={`button-delete-stack-${stack.id}`}
            title="Ungroup stack"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {isEditing ? (
              <div className="flex items-center gap-1 mb-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onClick={handleInputClick}
                  className="text-xl font-bold text-center bg-transparent border-none shadow-none focus:ring-2 focus:ring-amber-500 px-2"
                  data-testid={`input-stack-name-${stack.id}`}
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-700 ml-2"
                  data-testid={`button-save-stack-${stack.id}`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="text-red-600 hover:text-red-700"
                  data-testid={`button-cancel-stack-${stack.id}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h3 
                className="font-bold text-xl mb-2 cursor-pointer hover:text-amber-700 transition-colors" 
                data-testid={`text-stack-name-${stack.id}`}
                onClick={handleEditClick}
              >
                {stack.name}
              </h3>
            )}
            
            <div className="text-center">
              {recipeCount === 0 ? (
                <span className="text-sm text-amber-600/70" data-testid={`text-empty-stack-${stack.id}`}>
                  Empty stack
                </span>
              ) : (
                <span className="text-sm text-amber-700 font-medium" data-testid={`text-recipe-count-${stack.id}`}>
                  {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}