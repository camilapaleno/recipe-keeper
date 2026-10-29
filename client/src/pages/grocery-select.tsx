import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell, { CompactHeader } from "@/components/page-shell";
import { getColorFromRecipe } from "@/lib/colors";
import { recipes, type Recipe } from "@/lib/recipes";
import { useGroceryRun } from "@/lib/grocery";

export default function GrocerySelect() {
  const [, navigate] = useLocation();
  const { selectedRecipes, startRun } = useGroceryRun();
  // Coming back from the list keeps the current picks.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(selectedRecipes.map((r) => r.id)),
  );

  const toggle = (recipe: Recipe) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(recipe.id)) next.delete(recipe.id);
      else next.add(recipe.id);
      return next;
    });
  };

  const handleContinue = () => {
    startRun(recipes.filter((r) => selected.has(r.id)).map((r) => r.id));
    navigate("/grocery/list");
  };

  return (
    <PageShell showTopImage={false} title={<CompactHeader backHref="/" backLabel="all recipes" />}>
      <main className="pb-32 px-4">
        <div className="select-grid" data-testid="grid-grocery-select">
          {recipes.map((recipe) => {
            const isSelected = selected.has(recipe.id);
            return (
              <button
                key={recipe.id}
                type="button"
                className={`select-card ${isSelected ? "is-selected" : ""}`}
                style={{ backgroundColor: getColorFromRecipe(recipe, 0) }}
                role="checkbox"
                aria-checked={isSelected}
                onClick={() => toggle(recipe)}
                data-testid={`select-recipe-${recipe.id}`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}assets/overlay-${(recipe.id.charCodeAt(recipe.id.length - 1) % 4) + 1}.png`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <span className="recipe-title relative z-10 text-2xl sm:text-3xl lowercase opacity-70 leading-tight">
                  {recipe.title}
                </span>
                <span className="select-badge" aria-hidden="true">
                  {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      <div className="grocery-footer">
        <Button
          onClick={handleContinue}
          disabled={selected.size === 0}
          variant="outline"
          className="gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 shadow-lg"
          data-testid="button-continue-grocery"
        >
          {selected.size === 0
            ? "select at least one recipe"
            : `continue with ${selected.size} ${selected.size === 1 ? "recipe" : "recipes"}`}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageShell>
  );
}
