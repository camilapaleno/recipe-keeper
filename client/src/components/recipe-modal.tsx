import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Edit, Eye, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRecipeSchema } from "@shared/schema";
import { useRecipes } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@shared/schema";
import { z } from "zod";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onEditModeChange: (isEdit: boolean) => void;
}

const recipeFormSchema = insertRecipeSchema.extend({
  ingredientsText: z.string(),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;

export default function RecipeModal({
  recipe,
  isOpen,
  isEditMode,
  onClose,
  onEditModeChange,
}: RecipeModalProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const { updateRecipe, deleteRecipe, createRecipe } = useRecipes();
  const { toast } = useToast();

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      ingredientsText: "",
      directions: "",
      position: Date.now(),
      stackId: null,
    },
  });

  useEffect(() => {
    if (recipe) {
      form.reset({
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        ingredientsText: recipe.ingredients.join('\n'),
        directions: recipe.directions,
        position: recipe.position,
        stackId: recipe.stackId,
      });
      setCheckedIngredients(new Set());
    } else {
      form.reset({
        title: "",
        description: "",
        category: "",
        ingredientsText: "",
        directions: "",
        position: Date.now(),
        stackId: null,
      });
    }
  }, [recipe, form]);

  const handleSave = async (data: RecipeFormData) => {
    const ingredients = data.ingredientsText
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    const recipeData = {
      ...data,
      ingredients,
    };
    delete (recipeData as any).ingredientsText;

    try {
      if (recipe) {
        await updateRecipe.mutateAsync({ id: recipe.id, data: recipeData });
        toast({ title: "Recipe updated successfully" });
      } else {
        await createRecipe.mutateAsync(recipeData);
        toast({ title: "Recipe created successfully" });
        onClose();
      }
      onEditModeChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save recipe",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!recipe) return;
    
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe.mutateAsync(recipe.id);
        toast({ title: "Recipe deleted successfully" });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete recipe",
          variant: "destructive",
        });
      }
    }
  };

  const toggleIngredientCheck = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose} data-testid="modal-recipe-overlay">
      <div className="full-card" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-modal-title">
              {isEditMode ? (recipe ? 'Edit Recipe' : 'New Recipe') : (recipe?.title || 'Recipe')}
            </h2>
            <div className="flex gap-2">
              {recipe && !isEditMode && (
                <Button
                  variant="secondary"
                  onClick={() => onEditModeChange(true)}
                  data-testid="button-edit-recipe"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {isEditMode && (
                <Button
                  variant="secondary"
                  onClick={() => onEditModeChange(false)}
                  data-testid="button-view-recipe"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-lg font-semibold">Title</Label>
              {isEditMode ? (
                <Input
                  {...form.register("title")}
                  placeholder="Recipe title"
                  className="mt-2"
                  data-testid="input-recipe-title"
                />
              ) : (
                <div className="mt-2 text-foreground" data-testid="text-recipe-title">
                  {recipe?.title || "Untitled Recipe"}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-lg font-semibold">Category</Label>
              {isEditMode ? (
                <Input
                  {...form.register("category")}
                  placeholder="e.g., Dessert, Main Course, etc."
                  className="mt-2"
                  data-testid="input-recipe-category"
                />
              ) : (
                <div className="mt-2 text-muted-foreground" data-testid="text-recipe-category">
                  {recipe?.category || "No category"}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
              {isEditMode ? (
                <Textarea
                  {...form.register("description")}
                  placeholder="Brief description of the recipe"
                  className="mt-2"
                  rows={3}
                  data-testid="textarea-recipe-description"
                />
              ) : (
                <div className="mt-2 text-muted-foreground" data-testid="text-recipe-description">
                  {recipe?.description || "No description"}
                </div>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <Label className="text-lg font-semibold">Ingredients</Label>
              {isEditMode ? (
                <Textarea
                  {...form.register("ingredientsText")}
                  placeholder="Enter ingredients, one per line"
                  className="mt-2"
                  rows={8}
                  data-testid="textarea-recipe-ingredients"
                />
              ) : (
                <div className="mt-3 space-y-2" data-testid="list-recipe-ingredients">
                  {recipe?.ingredients?.map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <Checkbox
                        checked={checkedIngredients.has(index)}
                        onCheckedChange={() => toggleIngredientCheck(index)}
                        data-testid={`checkbox-ingredient-${index}`}
                      />
                      <span
                        className={`${checkedIngredients.has(index) ? 'line-through opacity-60' : ''}`}
                        data-testid={`text-ingredient-${index}`}
                      >
                        {ingredient}
                      </span>
                    </div>
                  )) || <div className="text-muted-foreground">No ingredients listed</div>}
                </div>
              )}
            </div>

            {/* Directions */}
            <div>
              <Label htmlFor="directions" className="text-lg font-semibold">Directions</Label>
              {isEditMode ? (
                <Textarea
                  {...form.register("directions")}
                  placeholder="Enter cooking directions"
                  className="mt-2"
                  rows={10}
                  data-testid="textarea-recipe-directions"
                />
              ) : (
                <div className="mt-2 text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-recipe-directions">
                  {recipe?.directions || "No directions provided"}
                </div>
              )}
            </div>

            {/* Save/Cancel Buttons (shown in edit mode) */}
            {isEditMode && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="submit"
                  disabled={createRecipe.isPending || updateRecipe.isPending}
                  data-testid="button-save-recipe"
                >
                  {createRecipe.isPending || updateRecipe.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onEditModeChange(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                {recipe && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    className="ml-auto"
                    disabled={deleteRecipe.isPending}
                    data-testid="button-delete-recipe"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleteRecipe.isPending ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}