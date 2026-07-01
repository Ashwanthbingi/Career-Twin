import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRagResumeAnalysis } from "../services/apiService";

export function useRagResumeAnalysis(userId: number) {
  return useQuery({
    queryKey: ["ragResumeAnalysis", userId],
    queryFn: () => fetchRagResumeAnalysis(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes stale time
  });
}

export function useTriggerRagResumeAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => fetchRagResumeAnalysis(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["ragResumeAnalysis", userId] });
    },
  });
}
