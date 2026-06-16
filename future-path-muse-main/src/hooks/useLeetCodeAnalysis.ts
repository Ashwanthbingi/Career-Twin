import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  analyzeLeetCodeProfile,
  fetchLeetCodeIntelligence,
} from "../services/apiService";
import { LeetCodeAnalysisRequest } from "../types/digital-twin";

export function useLeetCodeAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LeetCodeAnalysisRequest) => analyzeLeetCodeProfile(request),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["digitalTwin", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["digitalTwin", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["careerMatches", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["skillGap", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["validatedSkills", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["skillConfidenceSummary", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["leetcodeIntelligence", variables.userId] }),
      ]);
    },
  });
}

export function useLeetCodeIntelligence(userId: number) {
  return useQuery({
    queryKey: ["leetcodeIntelligence", userId],
    queryFn: () => fetchLeetCodeIntelligence(userId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
