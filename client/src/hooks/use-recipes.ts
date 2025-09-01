import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientStorage } from "@/lib/client-storage";
import type { Recipe, InsertRecipe } from "@shared/schema";

export function useRecipes() {
  const queryClient = useQueryClient();

  const query = useQuery<Recipe[]>({
    queryKey: ["recipes"],
    queryFn: () => clientStorage.getRecipes(),
  });

  const createRecipe = useMutation({
    mutationFn: async (data: InsertRecipe) => {
      return await clientStorage.createRecipe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertRecipe> }) => {
      return await clientStorage.updateRecipe(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      return await clientStorage.deleteRecipe(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
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