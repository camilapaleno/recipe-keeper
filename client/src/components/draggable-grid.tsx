import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import RecipeCard from "./recipe-card";
import StackCard from "./stack-card";
import { useRecipes } from "@/hooks/use-recipes";
import { useStacks } from "@/hooks/use-stacks";
import type { Recipe, Stack } from "@shared/schema";

interface DraggableGridProps {
  onRecipeClick: (recipe: Recipe) => void;
  onStackClick: (stack: Stack) => void;
  expandedStack: string | null;
}

interface GridItem {
  id: string;
  type: 'recipe' | 'stack';
  data: Recipe | Stack;
  position: number;
}

interface DragItem {
  item: GridItem;
  startIndex: number;
  dragPreview?: HTMLDivElement;
}

export default function DraggableGrid({
  onRecipeClick,
  onStackClick,
  expandedStack,
}: DraggableGridProps) {
  const { data: recipes = [], updateRecipe } = useRecipes();
  const { data: stacks = [], updateStack } = useStacks();
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use useMemo to prevent infinite re-renders
  const gridItems = useMemo(() => {
    const freeRecipes = recipes.filter((recipe: Recipe) => !recipe.stackId);
    const items: GridItem[] = [
      ...freeRecipes.map((recipe: Recipe) => ({
        id: recipe.id,
        type: 'recipe' as const,
        data: recipe,
        position: recipe.position,
      })),
      ...stacks.map((stack: Stack) => ({
        id: stack.id,
        type: 'stack' as const,
        data: stack,
        position: stack.position,
      })),
    ];
    
    items.sort((a, b) => a.position - b.position);
    return items;
  }, [recipes, stacks]);

  // Use useMemo for fan-out recipes to avoid useEffect
  const fanOutRecipes = useMemo(() => {
    if (!expandedStack) return [];
    return recipes.filter((recipe: Recipe) => recipe.stackId === expandedStack);
  }, [expandedStack, recipes]);

  const getRecipeCountForStack = (stackId: string) => {
    return recipes.filter((recipe: Recipe) => recipe.stackId === stackId).length;
  };

  const handleStackClick = (stack: Stack) => {
    onStackClick(stack);
  };

  const handleDragStart = (item: GridItem, index: number, event: React.DragEvent) => {
    event.stopPropagation();
    
    // Prevent starting new drag if already reordering
    if (isReordering) {
      event.preventDefault();
      return;
    }
    
    // Reset all drag states first
    setDragOverIndex(null);
    setDropTarget(null);
    setDragItem({ item, startIndex: index });
    
    // Clear any existing timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Create a custom drag preview
    const dragPreview = document.createElement('div');
    dragPreview.className = 'recipe-card opacity-80 transform rotate-3 scale-105';
    dragPreview.style.width = '200px';
    dragPreview.style.height = '300px';
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-1000px';
    dragPreview.innerHTML = `
      <div class="p-4 h-full flex flex-col bg-card border border-border rounded-lg">
        <h3 class="font-semibold text-lg mb-2 line-clamp-2">${item.type === 'recipe' ? (item.data as Recipe).title : (item.data as Stack).name}</h3>
        <p class="text-muted-foreground text-sm flex-1 line-clamp-4">${item.type === 'recipe' ? (item.data as Recipe).description : `Stack with recipes`}</p>
      </div>
    `;
    
    document.body.appendChild(dragPreview);
    event.dataTransfer.setDragImage(dragPreview, 100, 150);
    
    // Clean up the preview after drag starts
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview);
      }
    }, 0);
    
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent, index?: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    if (dragItem && index !== undefined && !isReordering) {
      const targetItem = gridItems[index];
      
      // If dragging recipe over stack center, allow drop on stack (but not stacks on stacks)
      if (dragItem.item.type === 'recipe' && targetItem?.type === 'stack') {
        setDropTarget(targetItem.id);
        setDragOverIndex(null);
        return;
      }
      
      // For horizontal reordering, determine left or right side
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = event.clientX;
      const centerX = rect.left + rect.width / 2;
      
      // If dragging to the left side, insert before current item
      // If dragging to the right side, insert after current item
      const insertIndex = mouseX < centerX ? index : index + 1;
      
      // Only update if the index actually changed
      if (insertIndex !== dragOverIndex) {
        setDropTarget(null);
        setDragOverIndex(insertIndex);
      }
    }
  };

  const handleDragEnter = (event: React.DragEvent, targetItem: GridItem, index: number) => {
    event.preventDefault();
    
    if (!dragItem) return;
    
    // Allow recipes to be dropped on stacks (center area), but not stacks on stacks
    if (dragItem.item.type === 'recipe' && targetItem.type === 'stack') {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = event.clientX;
      const centerX = rect.left + rect.width / 2;
      const threshold = rect.width * 0.3; // 30% from edges for stack drop
      
      // Only allow stack drop in center area
      if (mouseX > centerX - threshold && mouseX < centerX + threshold) {
        setDropTarget(targetItem.id);
        setDragOverIndex(null);
        return;
      }
    }
    
    // Handle horizontal reordering
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX;
    const centerX = rect.left + rect.width / 2;
    
    const insertIndex = mouseX < centerX ? index : index + 1;
    setDropTarget(null);
    setDragOverIndex(insertIndex);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    // Only clear drop target if we're leaving the grid entirely
    if (!gridRef.current?.contains(event.relatedTarget as Node)) {
      setDropTarget(null);
      setDragOverIndex(null);
    }
  };

  const handleDropOnStack = async (recipe: Recipe, stackId: string) => {
    try {
      await updateRecipe.mutateAsync({
        id: recipe.id,
        data: {
          ...recipe,
          stackId,
        },
      });
      setDropTarget(null);
      setDragItem(null);
    } catch (error) {
      console.error('Failed to add recipe to stack:', error);
      setDropTarget(null);
      setDragItem(null);
    }
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    
    if (!dragItem || isReordering) {
      setDragOverIndex(null);
      setDropTarget(null);
      return;
    }

    const { item, startIndex } = dragItem;
    
    // If dropping recipe on stack, handle that separately
    if (dropTarget && item.type === 'recipe') {
      setIsReordering(true);
      await handleDropOnStack(item.data as Recipe, dropTarget);
      setIsReordering(false);
      return;
    }
    
    // Use dragOverIndex for reordering
    const dropIndex = dragOverIndex;
    if (dropIndex === null) {
      setDragItem(null);
      setDragOverIndex(null);
      setDropTarget(null);
      return;
    }

    // Adjust dropIndex to account for the item being removed from its original position
    // When dragging forwards (dropIndex > startIndex), we need to account for the shift
    let adjustedDropIndex = dropIndex;
    if (dropIndex > startIndex) {
      adjustedDropIndex = dropIndex - 1;
    }
    
    // If the adjusted drop index equals start index, no movement needed
    if (adjustedDropIndex === startIndex) {
      setDragItem(null);
      setDragOverIndex(null);
      setDropTarget(null);
      return;
    }

    // Prevent duplicate drops
    setIsReordering(true);
    
    // Calculate new position based on adjusted drop index
    // Remove the dragged item from consideration for position calculation
    const sortedItems = [...gridItems]
      .filter(gridItem => gridItem.id !== item.id)
      .sort((a, b) => a.position - b.position);
    let newPosition: number;
    
    // Generate a more unique position using timestamp and random
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100);
    
    if (adjustedDropIndex === 0) {
      // Moving to first position - ensure it's definitely smaller
      newPosition = (sortedItems[0]?.position || 1000) - 2000 - random;
    } else if (adjustedDropIndex >= sortedItems.length) {
      // Moving to last position - ensure it's definitely larger
      newPosition = (sortedItems[sortedItems.length - 1]?.position || 0) + 2000 + random;
    } else {
      // Insert at specific position with better gap calculation
      const targetItem = sortedItems[adjustedDropIndex];
      const prevItem = sortedItems[adjustedDropIndex - 1];
      
      if (prevItem && targetItem) {
        const gap = targetItem.position - prevItem.position;
        if (gap > 100) {
          // Use middle position if there's enough gap
          newPosition = Math.floor((prevItem.position + targetItem.position) / 2);
        } else {
          // Create new gap with larger spacing
          newPosition = prevItem.position + 1000 + random;
        }
      } else {
        newPosition = targetItem.position - 2000 - random;
      }
    }
    
    try {
      if (item.type === 'recipe') {
        await updateRecipe.mutateAsync({
          id: item.id,
          data: {
            ...(item.data as Recipe),
            position: newPosition,
          },
        });
      } else {
        await updateStack.mutateAsync({
          id: item.id,
          data: {
            ...(item.data as Stack),
            position: newPosition,
          },
        });
      }
      
      // Add a longer delay before allowing next reorder to prevent conflicts
      dragTimeoutRef.current = setTimeout(() => {
        setIsReordering(false);
      }, 500);
      
    } catch (error) {
      console.error('Failed to update position:', error);
      setIsReordering(false);
    }

    setDragItem(null);
    setDragOverIndex(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    // Clear any pending timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // Reset drag state immediately
    setDragItem(null);
    setDragOverIndex(null);
    setDropTarget(null);
    
    // Allow some time for any pending mutations to complete
    setTimeout(() => {
      setIsReordering(false);
    }, 100);
  };

  return (
    <div className="relative">
      {gridItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-muted-foreground text-lg">
            Click to add a new recipe or collection
          </div>
        </div>
      ) : (
        <div 
          ref={gridRef}
          className="grid-container" 
          data-testid="grid-recipe-container"
          onDragLeave={handleDragLeave}
        >
          {gridItems.map((item, index) => {
            const isDragging = dragItem?.item.id === item.id;
            
            return (
              <div key={item.id} className="relative">
                {/* Drop line indicator - centered between cards */}
                {dragOverIndex === index && dragItem && !isDragging && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.5 h-16 bg-primary rounded-full z-20 pointer-events-none" />
                )}
                
                <div 
                  className={`relative ${
                    isDragging ? 'opacity-50 scale-95' : ''
                  } ${isReordering ? 'pointer-events-none' : ''}`}
                  draggable={!isReordering}
                  onDragStart={(e) => handleDragStart(item, index, e)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, item, index)}
                  onDrop={handleDrop}
                >
                  {item.type === 'recipe' ? (
                    <RecipeCard
                      recipe={item.data as Recipe}
                      onClick={onRecipeClick}
                      isDragDisabled={true}
                    />
                  ) : (
                    <StackCard
                      stack={item.data as Stack}
                      recipeCount={getRecipeCountForStack(item.id)}
                      onClick={handleStackClick}
                      isExpanded={expandedStack === item.id}
                      isDropTarget={dropTarget === item.id}
                      isDragDisabled={true}
                      isReordering={isReordering}
                    />
                  )}
                </div>
              </div>
            );
          })}
          
          {/* End-of-list drop zone */}
          {gridItems.length > 0 && dragItem && (
            <div className="relative flex-shrink-0" style={{ width: '40px', minHeight: '220px' }}>
              {/* End-of-list drop indicator */}
              {dragOverIndex === gridItems.length && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-16 bg-primary rounded-full z-20 pointer-events-none" />
              )}
              
              <div 
                className="absolute inset-0 z-10"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragItem) {
                    setDropTarget(null);
                    setDragOverIndex(gridItems.length);
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  if (dragItem) {
                    setDropTarget(null);
                    setDragOverIndex(gridItems.length);
                  }
                }}
                onDrop={handleDrop}
              />
            </div>
          )}
        </div>
      )}

      {/* Fan-out animation for expanded stack */}
      <AnimatePresence>
        {expandedStack && fanOutRecipes.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => onStackClick({ id: expandedStack } as Stack)}>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="flex flex-wrap justify-center gap-8 max-w-none">
                {fanOutRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    className="fan-out-recipe-card"
                    initial={{ 
                      scale: 0.8,
                      opacity: 0 
                    }}
                    animate={{ 
                      scale: 1,
                      opacity: 1
                    }}
                    exit={{ 
                      scale: 0.8,
                      opacity: 0 
                    }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecipeClick(recipe);
                    }}
                    whileHover={{ scale: 1.05 }}
                    data-testid={`fan-out-recipe-${recipe.id}`}
                  >
                    <RecipeCard
                      recipe={recipe}
                      onClick={onRecipeClick}
                      isDragDisabled={true}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}