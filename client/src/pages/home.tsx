import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Layers } from "lucide-react";
import DraggableGrid from "@/components/draggable-grid";
import RecipeModal from "@/components/recipe-modal";
import { useRecipes } from "@/hooks/use-recipes";
import { useStacks } from "@/hooks/use-stacks";
import type { Recipe, Stack } from "@shared/schema";

export default function Home() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expandedStack, setExpandedStack] = useState<string | null>(null);

  const { createRecipe } = useRecipes();
  const { createStack } = useStacks();

  const handleNewRecipe = () => {
    setSelectedRecipe(null);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleNewStack = () => {
    createStack.mutate({
      name: "New Stack",
      description: "A new recipe collection",
      position: Math.floor(Date.now() / 1000), // Convert to seconds to fit in integer
    });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleStackClick = (stack: Stack) => {
    if (expandedStack === stack.id) {
      setExpandedStack(null);
    } else {
      setExpandedStack(stack.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="py-8 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-6" data-testid="title-recipe-keeper">
            Recipe Keeper
          </h1>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleNewRecipe}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              data-testid="button-new-recipe"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Recipe
            </Button>
            <Button
              onClick={handleNewStack}
              variant="secondary"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              data-testid="button-new-stack"
              disabled={createStack.isPending}
            >
              <Layers className="w-4 h-4 mr-2" />
              New Stack
            </Button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="pb-12">
        <DraggableGrid
          onRecipeClick={handleRecipeClick}
          onStackClick={handleStackClick}
          expandedStack={expandedStack}
        />
      </main>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        onClose={handleCloseModal}
        onEditModeChange={setIsEditMode}
      />
    </div>
  );
}
