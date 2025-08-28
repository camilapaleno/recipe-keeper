import { type User, type InsertUser, type Recipe, type InsertRecipe, type Stack, type InsertStack } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipe operations
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<boolean>;
  
  // Stack operations
  getStacks(): Promise<Stack[]>;
  getStack(id: string): Promise<Stack | undefined>;
  createStack(stack: InsertStack): Promise<Stack>;
  updateStack(id: string, stack: Partial<InsertStack>): Promise<Stack | undefined>;
  deleteStack(id: string): Promise<boolean>;
  
  // Recipe-Stack relationship
  getRecipesByStack(stackId: string): Promise<Recipe[]>;
  addRecipeToStack(recipeId: string, stackId: string): Promise<boolean>;
  removeRecipeFromStack(recipeId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private recipes: Map<string, Recipe>;
  private stacks: Map<string, Stack>;

  constructor() {
    this.users = new Map();
    this.recipes = new Map();
    this.stacks = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Recipe operations
  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).sort((a, b) => a.position - b.position);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = randomUUID();
    const recipe: Recipe = { 
      ...insertRecipe, 
      id,
      description: insertRecipe.description || "",
      category: insertRecipe.category || "",
      ingredients: Array.isArray(insertRecipe.ingredients) ? insertRecipe.ingredients : [],
      directions: insertRecipe.directions || "",
      position: insertRecipe.position || 0,
      stackId: insertRecipe.stackId || null
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async updateRecipe(id: string, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const existing = this.recipes.get(id);
    if (!existing) return undefined;
    
    const updated: Recipe = { 
      ...existing, 
      ...updateData,
      ingredients: Array.isArray(updateData.ingredients) ? updateData.ingredients : existing.ingredients,
    };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Stack operations
  async getStacks(): Promise<Stack[]> {
    return Array.from(this.stacks.values()).sort((a, b) => a.position - b.position);
  }

  async getStack(id: string): Promise<Stack | undefined> {
    return this.stacks.get(id);
  }

  async createStack(insertStack: InsertStack): Promise<Stack> {
    const id = randomUUID();
    const stack: Stack = { 
      ...insertStack, 
      id,
      description: insertStack.description || "",
      position: insertStack.position || 0
    };
    this.stacks.set(id, stack);
    return stack;
  }

  async updateStack(id: string, updateData: Partial<InsertStack>): Promise<Stack | undefined> {
    const existing = this.stacks.get(id);
    if (!existing) return undefined;
    
    const updated: Stack = { ...existing, ...updateData };
    this.stacks.set(id, updated);
    return updated;
  }

  async deleteStack(id: string): Promise<boolean> {
    // Remove all recipes from this stack first
    const recipes = Array.from(this.recipes.values());
    for (const recipe of recipes) {
      if (recipe.stackId === id) {
        await this.updateRecipe(recipe.id, { stackId: null });
      }
    }
    return this.stacks.delete(id);
  }

  // Recipe-Stack relationship
  async getRecipesByStack(stackId: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values())
      .filter(recipe => recipe.stackId === stackId)
      .sort((a, b) => a.position - b.position);
  }

  async addRecipeToStack(recipeId: string, stackId: string): Promise<boolean> {
    const recipe = this.recipes.get(recipeId);
    const stack = this.stacks.get(stackId);
    if (!recipe || !stack) return false;
    
    const updated: Recipe = { ...recipe, stackId };
    this.recipes.set(recipeId, updated);
    return true;
  }

  async removeRecipeFromStack(recipeId: string): Promise<boolean> {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return false;
    
    const updated: Recipe = { ...recipe, stackId: null };
    this.recipes.set(recipeId, updated);
    return true;
  }
}

export const storage = new MemStorage();
