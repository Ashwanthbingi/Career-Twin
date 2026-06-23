import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRagRoadmap } from "../services/apiService";

export function useRagRoadmap(userId: number, targetRole: string) {
  return useQuery({
    queryKey: ["ragRoadmap", userId, targetRole],
    queryFn: () => fetchRagRoadmap(userId, targetRole),
    enabled: !!userId && !!targetRole,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTriggerRagRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, targetRole }: { userId: number; targetRole: string }) => 
      fetchRagRoadmap(userId, targetRole),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ragRoadmap", variables.userId, variables.targetRole] });
    },
  });
}
