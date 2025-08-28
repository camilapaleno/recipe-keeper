import { useState, useEffect } from "react";
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

export default function DraggableGrid({
  onRecipeClick,
  onStackClick,
  expandedStack,
}: DraggableGridProps) {
  const { data: recipes = [] } = useRecipes();
  const { data: stacks = [] } = useStacks();
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [fanOutRecipes, setFanOutRecipes] = useState<Recipe[]>([]);

  // Combine recipes and stacks into grid items
  useEffect(() => {
    if (!recipes || !stacks) return;
    
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
    setGridItems(items);
  }, [recipes, stacks]);

  // Handle stack expansion
  useEffect(() => {
    if (expandedStack) {
      const stackRecipes = recipes.filter((recipe: Recipe) => recipe.stackId === expandedStack);
      setFanOutRecipes(stackRecipes);
    } else {
      setFanOutRecipes([]);
    }
  }, [expandedStack, recipes]);

  const getRecipeCountForStack = (stackId: string) => {
    return recipes.filter((recipe: Recipe) => recipe.stackId === stackId).length;
  };

  const handleStackClick = (stack: Stack) => {
    onStackClick(stack);
  };

  // Show only items that exist, plus one empty slot if there are items
  const hasItems = gridItems.length > 0;
  const slotsToShow = hasItems ? gridItems.length + 1 : 1;

  return (
    <div className="relative">
      <div className="grid-container" data-testid="grid-recipe-container">
        {Array.from({ length: slotsToShow }, (_, index) => {
          const item = gridItems[index];
          return (
            <div key={index} className="relative">
              {item ? (
                item.type === 'recipe' ? (
                  <RecipeCard
                    recipe={item.data as Recipe}
                    onClick={onRecipeClick}
                  />
                ) : (
                  <StackCard
                    stack={item.data as Stack}
                    recipeCount={getRecipeCountForStack(item.id)}
                    onClick={handleStackClick}
                    isExpanded={expandedStack === item.id}
                  />
                )
              ) : (
                <div className="recipe-card border-dashed border-2 border-border bg-muted/20">
                  <div className="p-4 h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Plus className="w-8 h-8 mb-2" />
                    <p className="text-sm">Empty Slot</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fan-out animation for expanded stack */}
      <AnimatePresence>
        {expandedStack && fanOutRecipes.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => onStackClick({ id: expandedStack } as Stack)}>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative">
                {fanOutRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      rotate: 0,
                      scale: 0.8,
                      opacity: 0 
                    }}
                    animate={{ 
                      x: Math.cos((index * 2 * Math.PI) / fanOutRecipes.length) * 200,
                      y: Math.sin((index * 2 * Math.PI) / fanOutRecipes.length) * 150,
                      rotate: (index * 15) - (fanOutRecipes.length * 7.5),
                      scale: 0.7,
                      opacity: 1
                    }}
                    exit={{ 
                      x: 0, 
                      y: 0, 
                      rotate: 0,
                      scale: 0.8,
                      opacity: 0 
                    }}
                    transition={{ 
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    className="absolute top-0 left-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRecipeClick(recipe);
                    }}
                    whileHover={{ scale: 0.75 }}
                    data-testid={`fan-out-recipe-${recipe.id}`}
                  >
                    <div className="w-48 h-80">
                      <RecipeCard
                        recipe={recipe}
                        onClick={onRecipeClick}
                        isDragDisabled={true}
                      />
                    </div>
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