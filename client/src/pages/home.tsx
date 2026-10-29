import { useState } from "react";
import { Link } from "wouter";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell, { PageTitle } from "@/components/page-shell";
import RecipeCard from "@/components/recipe-card";
import RecipeModal from "@/components/recipe-modal";
import { recipes, type Recipe } from "@/lib/recipes";
import { useGroceryRun } from "@/lib/grocery";

export default function Home() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { isActive } = useGroceryRun();

  return (
    <PageShell
      title={
        <PageTitle
          actions={
            <Button
              asChild
              variant="outline"
              className="gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all border bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
              data-testid="button-grocery-run"
            >
              <Link href={isActive ? "/grocery/list" : "/grocery"}>
                <ShoppingBasket className="w-4 h-4 mr-2" />
                {isActive ? "continue grocery run" : "start grocery run"}
              </Link>
            </Button>
          }
        >
          <span data-testid="title-recipe-keeper">recipe<br />collection</span>
        </PageTitle>
      }
    >
      <main className="pb-12">
        <div className="grid-container" data-testid="grid-recipe-container">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="grid-recipe-item relative">
              <RecipeCard recipe={recipe} onClick={setSelectedRecipe} />
            </div>
          ))}
        </div>
      </main>

      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    </PageShell>
  );
}
