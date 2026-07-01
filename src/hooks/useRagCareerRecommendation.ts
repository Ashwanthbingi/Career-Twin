import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRagCareerRecommendation } from "../services/apiService";

export function useRagCareerRecommendation(userId: number) {
  return useQuery({
    queryKey: ["ragCareerRecommendation", userId],
    queryFn: () => fetchRagCareerRecommendation(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useTriggerRagCareerRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => fetchRagCareerRecommendation(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["ragCareerRecommendation", userId] });
    },
  });
}
