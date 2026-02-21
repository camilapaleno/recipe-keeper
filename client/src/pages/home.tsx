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

  const handleExportSeed = () => {
    const recipes = localStorage.getItem('recipestack-recipes');
    if (!recipes) return;
    navigator.clipboard.writeText(recipes);
    alert('Recipes copied to clipboard! Paste to Claude to update seed data.');
  };

  return (
    <div className="min-h-screen bg-background relative isolate">
      {/* Background images - sit behind all content */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
        <img
          src={`${import.meta.env.BASE_URL}assets/recipe-top.png`}
          alt=""
          style={{ width: '100%', minWidth: '1280px', display: 'block', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -2 }}>
        <img
          src={`${import.meta.env.BASE_URL}assets/recipe-grid.png`}
          alt=""
          style={{ width: '100%', minWidth: '1280px', display: 'block', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Header Section */}
      <header className="py-16 px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* <div className="mb-8">
            <Bean className="w-12 h-12 mx-auto mb-6 text-foreground" />
          </div> */}
          <div className="relative">
            <img
              src={`${import.meta.env.BASE_URL}assets/recipe-title-accent.png`}
              alt=""
              className="w-full pointer-events-none"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <h1
                className="text-7xl font-normal text-foreground"
                data-testid="title-recipe-keeper"
                style={{
                  fontFamily: "'Times New Roman Condensed', serif",
                  WebkitTextStroke: '15px white',
                  paintOrder: 'stroke fill',
                }}
              >
                recipe<br />collection
              </h1>
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
        </div>
      </header>

      {/* Dev-only export button */}
      {window.location.hostname === 'localhost' && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleExportSeed}
            className="text-xs px-2 py-1 bg-black/10 hover:bg-black/20 rounded text-gray-600"
          >
            export seed
          </button>
        </div>
      )}

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
