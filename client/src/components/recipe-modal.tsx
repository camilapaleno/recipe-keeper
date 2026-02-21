import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Edit, Eye, Trash2, Save, Undo2, ExternalLink } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRecipeSchema } from "@shared/schema";
import { useRecipes } from "@/hooks/use-recipes";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@shared/schema";
import { z } from "zod";
import { getNextColor, RECIPE_COLORS } from "@/lib/colors";
import { getColorFromRecipe } from "@/lib/colors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onEditModeChange: (isEdit: boolean) => void;
}

const recipeFormSchema = insertRecipeSchema.extend({
  ingredientsText: z.string(),
  color: z.string().optional(),
});

type RecipeFormData = z.infer<typeof recipeFormSchema>;

function PatternPreview({ pattern }: { pattern: string }) {
  return (
    <div className="absolute inset-0">
      {(pattern === "horizontal" ? [1,2,3] : pattern === "horizontal-narrow" ? [1,2,3,4,5] : []).map((_, i, arr) => (
        <div key={i} className="absolute w-full bg-blue-400 opacity-50" style={{ height: '1px', top: `${((i + 1) * 100) / (arr.length + 1)}%` }} />
      ))}
      {pattern === "grid" && <>
        {[1,2,3].map((_, i) => <div key={`h${i}`} className="absolute w-full bg-blue-400 opacity-50" style={{ height: '1px', top: `${((i + 1) * 100) / 4}%` }} />)}
        {[1,2,3].map((_, i) => <div key={`v${i}`} className="absolute h-full bg-blue-400 opacity-50" style={{ width: '1px', left: `${((i + 1) * 100) / 4}%` }} />)}
      </>}
    </div>
  );
}

export default function RecipeModal({
  recipe,
  isOpen,
  isEditMode,
  onClose,
  onEditModeChange,
}: RecipeModalProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [patternDropdownOpen, setPatternDropdownOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => form.setValue("image", e.target?.result as string);
    reader.readAsDataURL(file);
  };
  const { updateRecipe, deleteRecipe, createRecipe, data: allRecipes = [] } = useRecipes();
  const { toast } = useToast();

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      ingredientsText: "",
      directions: "",
      position: Math.floor(Date.now() / 1000),
      stackId: null,
      image: "",
      link: "",
      color: getNextColor(allRecipes),
      linePattern: "horizontal",
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
        image: recipe.image || "",
        link: recipe.link || "",
        color: recipe.color || getNextColor(allRecipes),
        linePattern: recipe.linePattern || "horizontal",
      });
      setCheckedIngredients(new Set());
    } else {
      form.reset({
        title: "",
        description: "",
        category: "",
        ingredientsText: "",
        directions: "",
        position: Math.floor(Date.now() / 1000),
        stackId: null,
        image: "",
        link: "",
        color: getNextColor(allRecipes),
        linePattern: "horizontal",
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
      color: data.color || getNextColor(allRecipes),
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

  const currentColor = form.watch("color");
  const currentPattern = form.watch("linePattern");
  const backgroundColor = recipe ? getColorFromRecipe(recipe, 0) : currentColor;

  const renderLinePattern = () => {
    const pattern = recipe?.linePattern || currentPattern || "horizontal";

    switch (pattern) {
      case "horizontal":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ top: `${((i + 1) * 100) / 7}%` }}
              />
            ))}
          </div>
        );
      case "horizontal-narrow":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ top: `${((i + 1) * 100) / 13}%` }}
              />
            ))}
          </div>
        );
      case "grid":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ top: `${((i + 1) * 100) / 7}%` }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-[0.5px] bg-blue-600 bg-opacity-25"
                style={{ left: `${((i + 1) * 100) / 7}%` }}
              />
            ))}
          </div>
        );
      case "none":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="overlay" onClick={onClose} data-testid="modal-recipe-overlay">
      <div
        className="full-card relative"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor }}
      >
        {renderLinePattern()}
        <div className="p-6 relative z-10">
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 modal-edit-form">
            {/* Title with Color, Pattern, Edit/View, and Close on same line */}
            <div className="flex items-center gap-3">
              {isEditMode ? (
                <>
                  {/* Color Dropdown */}
                  <div className="relative self-stretch flex items-center">
                    <button
                      type="button"
                      onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                      className="w-9 h-full rounded-full border border-black/15 hover:bg-accent transition-all"
                      style={{ backgroundColor: form.watch("color") }}
                      data-testid="select-color-trigger"
                    />
                    {colorDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-black/15 rounded-md shadow-lg z-[2000] p-2">
                        <div className="flex flex-col gap-1">
                          {RECIPE_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                form.setValue("color", color);
                                setColorDropdownOpen(false);
                              }}
                              className="w-6 h-6 rounded-full border border-black/15 hover:bg-accent"
                              style={{ backgroundColor: color }}
                              data-testid={`select-color-${color}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pattern Dropdown */}
                  <div className="relative self-stretch flex items-center">
                    <button
                      type="button"
                      onClick={() => setPatternDropdownOpen(!patternDropdownOpen)}
                      className="w-9 h-full border rounded-full border-black/15 hover:bg-accent transition-all relative overflow-hidden bg-transparent"
                      data-testid="select-pattern-trigger"
                    >
                      <PatternPreview pattern={form.watch("linePattern") || "none"} />
                    </button>
                    {patternDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-black/15 rounded-md shadow-lg z-[2000] p-2">
                        <div className="flex flex-col gap-1">
                          {["horizontal", "horizontal-narrow", "grid", "none"].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => { form.setValue("linePattern", p); setPatternDropdownOpen(false); }}
                              className="w-6 h-6 border border-black/15 hover:bg-accent relative overflow-hidden bg-transparent"
                            >
                              <PatternPreview pattern={p} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    {...form.register("title")}
                    placeholder="Recipe title"
                    className="text-2xl font-bold flex-1 font-sans"
                    data-testid="input-recipe-title"
                  />

                  {/* Hidden Category Field */}
                  <Input
                    {...form.register("category")}
                    type="hidden"
                  />
                </>
              ) : (
                <h2 className="text-2xl font-bold text-foreground recipe-title flex-1" data-testid="text-recipe-title">
                  {recipe?.title || "Untitled Recipe"}
                </h2>
              )}

              {/* Edit/Save/Cancel and Close buttons */}
              {recipe && !isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditModeChange(true)}
                  data-testid="button-edit-recipe"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {isEditMode && (
                <>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    disabled={createRecipe.isPending || updateRecipe.isPending}
                    data-testid="button-save-recipe"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (recipe) {
                        onEditModeChange(false);
                      } else {
                        onClose();
                      }
                    }}
                    data-testid="button-cancel-edit"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              {recipe && !isEditMode && (
                <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                data-testid="button-close-modal"
              >
                <X className="w-4 h-4" />
              </Button>
              )}
            </div>

            {/* Description */}
            {(isEditMode || recipe?.description) && (
            <div>
              {isEditMode ? (
                <Textarea
                  {...form.register("description")}
                  placeholder="Brief description of the recipe"
                  rows={3}
                  data-testid="textarea-recipe-description"
                />
              ) : (
                <div className="recipe-description" data-testid="text-recipe-description">
                  {recipe?.description || "No description"}
                </div>
              )}
            </div>
            )}

            {/* Ingredients */}
            <div>
              {isEditMode ? (
                <Textarea
                  {...form.register("ingredientsText")}
                  placeholder="Ingredients (one per line)"
                  rows={8}
                  data-testid="textarea-recipe-ingredients"
                />
              ) : (
                <div className="space-y-2" data-testid="list-recipe-ingredients">
                  {recipe?.ingredients?.map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <Checkbox
                        checked={checkedIngredients.has(index)}
                        onCheckedChange={() => toggleIngredientCheck(index)}
                        className="w-6 h-6 cursor-pointer"
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
            {(isEditMode || recipe?.directions
            ) && (
            <div>
              {isEditMode ? (
                <Textarea
                  {...form.register("directions")}
                  placeholder="Directions"
                  rows={10}
                  data-testid="textarea-recipe-directions"
                />
              ) : (
                <div className="leading-relaxed whitespace-pre-line" data-testid="text-recipe-directions">
                  {recipe?.directions || "No directions provided"}
                </div>
              )}
            </div>
            )}

            {/* Image */}
            <div>
              {isEditMode ? (
                <div className="w-32 h-32">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                  />
                  {form.watch("image") ? (
                    <div className="relative w-full h-full">
                      <img
                        src={form.watch("image") ?? undefined}
                        alt="recipe"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="input-recipe-image"
                      />
                      <button
                        type="button"
                        onClick={() => form.setValue("image", "")}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-black/70"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer text-xs text-muted-foreground gap-1 transition-colors ${isDragOver ? 'border-primary bg-primary/5' : 'border-black/15 hover:border-black/30'}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); e.dataTransfer.files[0] && handleImageFile(e.dataTransfer.files[0]); }}
                      data-testid="input-recipe-image"
                    >
                      <span>drop image</span>
                    </div>
                  )}
                </div>
              ) : (
                recipe?.image && (
                  <div className="w-32 h-32" data-testid="text-recipe-image">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                  </div>
                )
              )}
            </div>

            {/* Recipe Link */}
            {(isEditMode || recipe?.link) && (
              <div>
                {isEditMode ? (
                  <Input
                    {...form.register("link")}
                    placeholder="Recipe link (optional)"
                    data-testid="input-recipe-link"
                  />
                ) : (
                  recipe?.link && (
                    <div data-testid="text-recipe-link">
                      <a
                        href={recipe.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-black/15 bg-black/5 text-foreground text-sm hover:bg-black/10 transition-colors no-underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-xs">{recipe.link}</span>
                      </a>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Delete Button (shown in edit mode) */}
            {isEditMode && recipe && (
              <div className="flex gap-3 pt-4 border-t border-black/15">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteRecipe.isPending}
                  data-testid="button-delete-recipe"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteRecipe.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}