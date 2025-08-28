import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRecipeSchema, insertStackSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Recipe routes
  app.get("/api/recipes", async (_req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post("/api/recipes", async (req, res) => {
    try {
      const validatedData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validatedData);
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  app.patch("/api/recipes/:id", async (req, res) => {
    try {
      const validatedData = insertRecipeSchema.partial().parse(req.body);
      const recipe = await storage.updateRecipe(req.params.id, validatedData);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRecipe(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Stack routes
  app.get("/api/stacks", async (_req, res) => {
    try {
      const stacks = await storage.getStacks();
      res.json(stacks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stacks" });
    }
  });

  app.get("/api/stacks/:id", async (req, res) => {
    try {
      const stack = await storage.getStack(req.params.id);
      if (!stack) {
        return res.status(404).json({ message: "Stack not found" });
      }
      res.json(stack);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stack" });
    }
  });

  app.get("/api/stacks/:id/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipesByStack(req.params.id);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stack recipes" });
    }
  });

  app.post("/api/stacks", async (req, res) => {
    try {
      const validatedData = insertStackSchema.parse(req.body);
      const stack = await storage.createStack(validatedData);
      res.status(201).json(stack);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stack data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create stack" });
    }
  });

  app.patch("/api/stacks/:id", async (req, res) => {
    try {
      const validatedData = insertStackSchema.partial().parse(req.body);
      const stack = await storage.updateStack(req.params.id, validatedData);
      if (!stack) {
        return res.status(404).json({ message: "Stack not found" });
      }
      res.json(stack);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid stack data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update stack" });
    }
  });

  app.delete("/api/stacks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStack(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Stack not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete stack" });
    }
  });

  // Recipe-Stack relationship routes
  app.patch("/api/recipes/:recipeId/stack/:stackId", async (req, res) => {
    try {
      const success = await storage.addRecipeToStack(req.params.recipeId, req.params.stackId);
      if (!success) {
        return res.status(404).json({ message: "Recipe or stack not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to add recipe to stack" });
    }
  });

  app.patch("/api/recipes/:recipeId/unstack", async (req, res) => {
    try {
      const success = await storage.removeRecipeFromStack(req.params.recipeId);
      if (!success) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove recipe from stack" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
