import { useMemo } from "react";
import { Redirect, useLocation } from "wouter";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import PageShell, { CompactHeader } from "@/components/page-shell";
import RecipeIcon from "@/components/recipe-icon";
import { buildGroceryList, useGroceryRun } from "@/lib/grocery";

export default function GroceryList() {
  const [, navigate] = useLocation();
  const { isActive, selectedRecipes, checked, toggleItem, completeRun } = useGroceryRun();
  const items = useMemo(() => buildGroceryList(selectedRecipes), [selectedRecipes]);

  if (!isActive) return <Redirect to="/grocery" />;

  const doneCount = items.filter((item) => checked.has(item.key)).length;

  const handleComplete = () => {
    if (doneCount < items.length && !confirm("Some items aren't checked off yet. Complete this grocery run anyway?")) {
      return;
    }
    completeRun();
    navigate("/");
  };

  return (
    <PageShell showTopImage={false} title={<CompactHeader backHref="/grocery" backLabel="change recipes" />}>
      <main className="pb-16 px-4">
        <div className="grocery-paper" data-testid="grocery-list">
          {/* Notebook lines */}
          <div className="grocery-paper-lines" aria-hidden="true" />

          <div className="relative z-10 p-6 sm:p-8">
            {/* Which recipe each icon belongs to */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 pb-5 mb-4 border-b border-black/15">
              {selectedRecipes.map((recipe) => (
                <span key={recipe.id} className="flex items-center gap-2 text-sm">
                  <RecipeIcon recipe={recipe} />
                  <span className="lowercase">{recipe.title}</span>
                </span>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-2" data-testid="text-grocery-progress">
              {doneCount} of {items.length} in the basket
            </p>

            <ul>
              {items.map((item) => {
                const isChecked = checked.has(item.key);
                const id = `grocery-${item.key.replace(/\W+/g, "-")}`;
                return (
                  <li key={item.key} className="grocery-item">
                    <Checkbox
                      id={id}
                      checked={isChecked}
                      onCheckedChange={() => toggleItem(item.key)}
                      className="w-6 h-6 mt-0.5 cursor-pointer bg-white/60"
                      data-testid={`checkbox-${id}`}
                    />
                    <label htmlFor={id} className="flex-1 min-w-0 cursor-pointer">
                      <span className={`block text-lg leading-snug ${isChecked ? "line-through opacity-50" : ""}`}>
                        {item.name}
                      </span>
                      <span className={`block text-xs text-muted-foreground ${isChecked ? "opacity-50" : ""}`}>
                        {item.lines.map((line) => line.text).join(" · ")}
                      </span>
                    </label>
                    <span className={`flex gap-1 shrink-0 ${isChecked ? "opacity-40" : ""}`}>
                      {item.recipes.map((recipe) => (
                        <RecipeIcon key={recipe.id} recipe={recipe} />
                      ))}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="pt-6 mt-2 flex justify-center">
              <Button
                onClick={handleComplete}
                variant="outline"
                className="gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                data-testid="button-complete-grocery"
              >
                <ShoppingBasket className="w-4 h-4" />
                complete grocery run
              </Button>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
