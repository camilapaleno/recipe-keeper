import { type Recipe, type Stack, type InsertRecipe, type InsertStack } from "@shared/schema";

// Browser-compatible UUID generation
function generateUUID(): string {
  return 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

const SEED_VERSION = "3";

// Default seed recipes synced from database
const DEFAULT_RECIPES: Recipe[] = [
  {
    id: "seed-1",
    title: "Lemon Orzo Salad",
    description: "https://lemonsandzest.com/lemon-orzo-salad/",
    category: "A Classic",
    ingredients: [
      "2 c orzo, uncooked",
      "1 tomato, chopped",
      "1 English cucumber, chopped",
      "1/2 red onion, small diced",
      "6 oz. feta cheese, crumbled",
      "2-3 garlic cloves, minced",
      "1/4 c fresh parsley, chopped",
      "1/4 c fresh basil, chopped",
      "Juice and zest of 1 lemon, 1.5-2 oz juice",
      "1/2 c extra virgin olive oil",
      "1/2 tsp sea salt",
      "1/2 tsp cracked pepper"
    ],
    directions: "Chop everything super small\nDon't overcook orzo\nMake sure orzo is cooled before adding ingredients",
    position: 0,
    stackId: null,
    color: "#e7f19a",
    image: "",
    link: null,
    linePattern: "horizontal",
  },
  {
    id: "seed-2",
    title: "Cowboy Caviar",
    description: "https://www.allrecipes.com/ultimate-cowboy-caviar-recipe-8653312",
    category: "Fiber",
    ingredients: [
      "2/3 cup finely diced red onion",
      "1 can black beans, drained and rinsed",
      "1 can corn",
      "1 can garbanzo beans",
      "1 cup diced fresh tomato",
      "1/2 cup chopped fresh cilantro",
      "1 diced avocado",
      "1 lime"
    ],
    directions: "",
    position: 1756368896,
    stackId: null,
    color: "#ffa57e",
    image: "",
    link: null,
    linePattern: "horizontal",
  },
  {
    id: "seed-3",
    title: "Black-Eyed Pea Salad",
    description: "Ate this every morning at the hostel in Kas, Turkey",
    category: "Turkish",
    ingredients: [
      "1 ½ cups cooked black-eyed peas (canned or homemade; drained/rinsed)",
      "1 medium onion, finely chopped",
      "3 stalks green onions, finely chopped",
      "½ cup parsley, chopped",
      "½ cup fresh dill, chopped",
      "1 small cucumber, chopped",
      "1 medium tomato, diced",
      "1 ½ tbsp lemon juice",
      "1 tbsp vinegar (any kind: apple cider, red wine, etc.)",
      "3 tbsp extra virgin olive oil",
      "1 tsp salt"
    ],
    directions: "Mix the lemon juice, vinegar, olive oil and salt for the dressing. I store it separately so the salad stays fresh longer.",
    position: 1756369055,
    stackId: null,
    color: "#fed07d",
    image: "https://www.fromachefskitchen.com/wp-content/uploads/2023/09/Black-Eyed-Pea-Salad.jpeg",
    link: null,
    linePattern: "horizontal",
  },
  {
    id: "seed-4",
    title: "Harvest Bowl",
    description: "So filling and healthy. Inspired by the harvest bowl at Sweetgreen.",
    category: "Easy",
    ingredients: [
      "Broccoli",
      "Carrots",
      "Feta",
      "Sweet potato",
      "Lemon",
      "Grain (Rice OK)",
      "Kale/Arugula",
      "Chicken"
    ],
    directions: "Put veggies in oven all together to crisp em up\nCook chicken in pan",
    position: 1756369215,
    stackId: null,
    color: "#fed07d",
    image: "",
    link: null,
    linePattern: "horizontal",
  },
  {
    id: "seed-5",
    title: "Gigi Pasta",
    description: "https://thebigmansworld.com/gigi-hadid-pasta/",
    category: "Pasta",
    ingredients: [
      "1/4 cup olive oil (this is too much oil)",
      "1 small red onion chopped",
      "1 clove garlic minced",
      "1/4 cup tomato paste",
      "1/2 cup heavy cream",
      "1 teaspoon red pepper flakes",
      "1 teaspoon salt",
      "1/2 teaspoon black pepper",
      "8 1/2 ounces shell pasta uncooked",
      "1 tablespoon butter",
      "1/4 cup parmesan cheese"
    ],
    directions: "Step 1- Cook tomato and aromatics. Add the garlic and onion to a large saucepan. Once soft, add the tomato paste and cook briefly. \nStep 2- Build the sauce. Add the cream and vodka and simmer until the alcohol evaporates. Add the seasonings, stir, and remove from the heat. \nStep 3- Cook the pasta. In a large pot, cook the pasta to al dente, strain, and reserve ¼ cup of the pasta water. \nStep 4- Combine. Fold in the butter and stir until it melts, then add the pasta, reserved pasta water, and parmesan. Once combined, serve with fresh herbs.",
    position: 1756369388,
    stackId: null,
    color: "#e7f19a",
    image: "https://thebigmansworld.com/wp-content/uploads/2024/11/gigi-hadid-pasta-recipe.jpg",
    link: null,
    linePattern: "horizontal",
  },
  {
    id: "seed-6",
    title: "Beef Udon Soup",
    description: "https://www.justonecookbook.com/beef-udon/",
    category: "",
    ingredients: [
      "2 cups dashi (2 cups water 1 tbsp dashi powder)",
      "1½ Tbsp soy sauce",
      "1 Tbsp mirin",
      "1 tsp sugar",
      "⅛ tsp Diamond Crystal kosher salt",
      "1 green onion/scallion (for topping)",
      "6–8 oz thinly sliced beef (such as ribeye) (or learn how to slice meat thinly at home)",
      "1 Tbsp neutral oil",
      "2 tsp sugar",
      "1 Tbsp soy sauce",
      "2 servings udon noodles (1.1 lb/500 g frozen or parboiled udon noodles; 6.3 oz/180 g dry udon noodles)"
    ],
    directions: "",
    position: 1756369562,
    stackId: null,
    color: "#ffa57e",
    image: "",
    link: null,
    linePattern: "horizontal",
  },
];

export class ClientStorage {
  private recipesKey = 'recipestack-recipes';
  private stacksKey = 'recipestack-stacks';
  private seedVersionKey = 'recipestack-seed-version';

  private getStoredRecipes(): Recipe[] {
    const stored = localStorage.getItem(this.recipesKey);
    const storedVersion = localStorage.getItem(this.seedVersionKey);

    if (!stored) {
      // First time user
      this.setStoredRecipes(DEFAULT_RECIPES);
      localStorage.setItem(this.seedVersionKey, SEED_VERSION);
      return DEFAULT_RECIPES;
    }

    // Full reset when version changes
    if (storedVersion !== SEED_VERSION) {
      this.setStoredRecipes(DEFAULT_RECIPES);
      localStorage.setItem(this.seedVersionKey, SEED_VERSION);
      return DEFAULT_RECIPES;
    }

    return JSON.parse(stored);
  }

  private setStoredRecipes(recipes: Recipe[]): void {
    localStorage.setItem(this.recipesKey, JSON.stringify(recipes));
  }

  private getStoredStacks(): Stack[] {
    const stored = localStorage.getItem(this.stacksKey);
    return stored ? JSON.parse(stored) : [];
  }

  private setStoredStacks(stacks: Stack[]): void {
    localStorage.setItem(this.stacksKey, JSON.stringify(stacks));
  }

  // Recipe operations
  async getRecipes(): Promise<Recipe[]> {
    return this.getStoredRecipes().sort((a, b) => a.position - b.position);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.getStoredRecipes().find(recipe => recipe.id === id);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const recipes = this.getStoredRecipes();
    const id = generateUUID();
    const recipe: Recipe = { 
      ...insertRecipe, 
      id,
      description: insertRecipe.description || "",
      category: insertRecipe.category || "",
      ingredients: Array.isArray(insertRecipe.ingredients) ? insertRecipe.ingredients : [],
      directions: insertRecipe.directions || "",
      position: insertRecipe.position || recipes.length,
      stackId: insertRecipe.stackId || null,
      color: insertRecipe.color || "#e7f19a",
      image: insertRecipe.image || ""
    };
    
    recipes.push(recipe);
    this.setStoredRecipes(recipes);
    return recipe;
  }

  async updateRecipe(id: string, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const recipes = this.getStoredRecipes();
    const index = recipes.findIndex(recipe => recipe.id === id);
    if (index === -1) return undefined;
    
    const updated: Recipe = { 
      ...recipes[index], 
      ...updateData,
      ingredients: Array.isArray(updateData.ingredients) ? updateData.ingredients : recipes[index].ingredients,
    };
    
    recipes[index] = updated;
    this.setStoredRecipes(recipes);
    return updated;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const recipes = this.getStoredRecipes();
    const filtered = recipes.filter(recipe => recipe.id !== id);
    if (filtered.length === recipes.length) return false;
    
    this.setStoredRecipes(filtered);
    return true;
  }

  // Stack operations
  async getStacks(): Promise<Stack[]> {
    return this.getStoredStacks().sort((a, b) => a.position - b.position);
  }

  async getStack(id: string): Promise<Stack | undefined> {
    return this.getStoredStacks().find(stack => stack.id === id);
  }

  async createStack(insertStack: InsertStack): Promise<Stack> {
    const stacks = this.getStoredStacks();
    const id = `stack-${generateUUID()}`;
    const stack: Stack = { 
      ...insertStack, 
      id,
      description: insertStack.description || "",
      position: insertStack.position || stacks.length
    };
    
    stacks.push(stack);
    this.setStoredStacks(stacks);
    return stack;
  }

  async updateStack(id: string, updateData: Partial<InsertStack>): Promise<Stack | undefined> {
    const stacks = this.getStoredStacks();
    const index = stacks.findIndex(stack => stack.id === id);
    if (index === -1) return undefined;
    
    const updated: Stack = { ...stacks[index], ...updateData };
    stacks[index] = updated;
    this.setStoredStacks(stacks);
    return updated;
  }

  async deleteStack(id: string): Promise<boolean> {
    const stacks = this.getStoredStacks();
    const filtered = stacks.filter(stack => stack.id !== id);
    if (filtered.length === stacks.length) return false;
    
    // Remove all recipes from this stack first
    const recipes = this.getStoredRecipes();
    const updatedRecipes = recipes.map(recipe => 
      recipe.stackId === id ? { ...recipe, stackId: null } : recipe
    );
    this.setStoredRecipes(updatedRecipes);
    
    this.setStoredStacks(filtered);
    return true;
  }

  // Recipe-Stack relationship
  async getRecipesByStack(stackId: string): Promise<Recipe[]> {
    return this.getStoredRecipes()
      .filter(recipe => recipe.stackId === stackId)
      .sort((a, b) => a.position - b.position);
  }

  async addRecipeToStack(recipeId: string, stackId: string): Promise<boolean> {
    const recipes = this.getStoredRecipes();
    const stacks = this.getStoredStacks();
    
    const recipe = recipes.find(r => r.id === recipeId);
    const stack = stacks.find(s => s.id === stackId);
    
    if (!recipe || !stack) return false;
    
    return (await this.updateRecipe(recipeId, { stackId })) !== undefined;
  }

  async removeRecipeFromStack(recipeId: string): Promise<boolean> {
    return (await this.updateRecipe(recipeId, { stackId: null })) !== undefined;
  }
}

export const clientStorage = new ClientStorage();