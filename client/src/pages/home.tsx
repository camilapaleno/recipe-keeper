import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Layers, Bean } from "lucide-react";
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
      <header className="py-16 px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <Bean className="w-16 h-16 mx-auto mb-6 text-foreground" />
          </div>
          <h1 className="text-4xl font-normal text-foreground mb-4" data-testid="title-recipe-keeper">
            recipe keeper
          </h1>
          <p className="text-muted-foreground mb-8 text-lg">
            add your recipes here to find them more easily
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleNewRecipe}
              variant="outline"
              className="gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all border bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
              data-testid="button-new-recipe"
            >
              <Plus className="w-4 h-4 mr-2" />
              add another recipe
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
