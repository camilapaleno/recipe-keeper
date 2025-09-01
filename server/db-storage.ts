import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { type User, type InsertUser, type Recipe, type InsertRecipe, type Stack, type InsertStack, recipes, stacks, users } from "@shared/schema";
import { type IStorage } from "./storage";
import { join } from "path";

const dbPath = join(process.cwd(), "database.sqlite");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Recipe operations
  async getRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes).orderBy(recipes.position);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const result = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
    return result[0];
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const result = await db.insert(recipes).values(insertRecipe).returning();
    return result[0];
  }

  async updateRecipe(id: string, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const result = await db.update(recipes)
      .set(updateData)
      .where(eq(recipes.id, id))
      .returning();
    return result[0];
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const result = await db.delete(recipes).where(eq(recipes.id, id));
    return result.rowCount > 0;
  }

  // Stack operations
  async getStacks(): Promise<Stack[]> {
    return await db.select().from(stacks).orderBy(stacks.position);
  }

  async getStack(id: string): Promise<Stack | undefined> {
    const result = await db.select().from(stacks).where(eq(stacks.id, id)).limit(1);
    return result[0];
  }

  async createStack(insertStack: InsertStack): Promise<Stack> {
    const result = await db.insert(stacks).values(insertStack).returning();
    return result[0];
  }

  async updateStack(id: string, updateData: Partial<InsertStack>): Promise<Stack | undefined> {
    const result = await db.update(stacks)
      .set(updateData)
      .where(eq(stacks.id, id))
      .returning();
    return result[0];
  }

  async deleteStack(id: string): Promise<boolean> {
    // Remove all recipes from this stack first
    await db.update(recipes)
      .set({ stackId: null })
      .where(eq(recipes.stackId, id));
    
    const result = await db.delete(stacks).where(eq(stacks.id, id));
    return result.rowCount > 0;
  }

  // Recipe-Stack relationship
  async getRecipesByStack(stackId: string): Promise<Recipe[]> {
    return await db.select().from(recipes)
      .where(eq(recipes.stackId, stackId))
      .orderBy(recipes.position);
  }

  async addRecipeToStack(recipeId: string, stackId: string): Promise<boolean> {
    // Verify both recipe and stack exist
    const [recipe, stack] = await Promise.all([
      this.getRecipe(recipeId),
      this.getStack(stackId)
    ]);
    
    if (!recipe || !stack) return false;
    
    const result = await db.update(recipes)
      .set({ stackId })
      .where(eq(recipes.id, recipeId));
    
    return result.rowCount > 0;
  }

  async removeRecipeFromStack(recipeId: string): Promise<boolean> {
    const result = await db.update(recipes)
      .set({ stackId: null })
      .where(eq(recipes.id, recipeId));
    
    return result.rowCount > 0;
  }
}