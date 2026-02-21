import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = sqliteTable("recipes", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default(""),
  ingredients: text("ingredients", { mode: "json" }).$type<string[]>().notNull().default([]),
  directions: text("directions").notNull().default(""),
  position: integer("position").notNull().default(0),
  stackId: text("stack_id"),
  color: text("color").notNull().default("#fed07d"),
  image: text("image"),
  link: text("link"),
  linePattern: text("line_pattern").notNull().default("horizontal"),
});

export const stacks = sqliteTable("stacks", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

export const insertStackSchema = createInsertSchema(stacks).omit({
  id: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertStack = z.infer<typeof insertStackSchema>;
export type Stack = typeof stacks.$inferSelect;

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
