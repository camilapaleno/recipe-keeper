import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientStorage } from "@/lib/client-storage";
import type { Stack, InsertStack, Recipe } from "@shared/schema";

export function useStacks() {
  const queryClient = useQueryClient();

  const query = useQuery<Stack[]>({
    queryKey: ["stacks"],
    queryFn: () => clientStorage.getStacks(),
  });

  const createStack = useMutation({
    mutationFn: async (data: InsertStack) => {
      return await clientStorage.createStack(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
    },
  });

  const updateStack = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertStack> }) => {
      return await clientStorage.updateStack(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
    },
  });

  const deleteStack = useMutation({
    mutationFn: async (id: string) => {
      return await clientStorage.deleteStack(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stacks"] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });

  const getRecipesByStack = (stackId: string) => {
    return useQuery<Recipe[]>({
      queryKey: ["stacks", stackId, "recipes"],
      queryFn: () => clientStorage.getRecipesByStack(stackId),
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