import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Recipe, InsertRecipe } from "@shared/schema";

export function useRecipes() {
  const queryClient = useQueryClient();

  const query = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const createRecipe = useMutation({
    mutationFn: async (data: InsertRecipe) => {
      const response = await apiRequest("POST", "/api/recipes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertRecipe> }) => {
      const response = await apiRequest("PATCH", `/api/recipes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/recipes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  };
}
