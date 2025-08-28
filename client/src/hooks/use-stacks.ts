import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Stack, InsertStack, Recipe } from "@shared/schema";

export function useStacks() {
  const queryClient = useQueryClient();

  const query = useQuery<Stack[]>({
    queryKey: ["/api/stacks"],
  });

  const createStack = useMutation({
    mutationFn: async (data: InsertStack) => {
      const response = await apiRequest("POST", "/api/stacks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stacks"] });
    },
  });

  const updateStack = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertStack> }) => {
      const response = await apiRequest("PATCH", `/api/stacks/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stacks"] });
    },
  });

  const deleteStack = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/stacks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stacks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
  });

  const getRecipesByStack = (stackId: string) => {
    return useQuery<Recipe[]>({
      queryKey: ["/api/stacks", stackId, "recipes"],
    });
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createStack,
    updateStack,
    deleteStack,
    getRecipesByStack,
  };
}
