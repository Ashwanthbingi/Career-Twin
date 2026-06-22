import { useMutation, useQueryClient } from "@tanstack/react-query";
import { analyzeGitHubPortfolio } from "../services/apiService";
import { GitHubAnalysisRequest } from "../types/digital-twin";

export function useGitHubAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GitHubAnalysisRequest) => analyzeGitHubPortfolio(request),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["digitalTwin", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["githubProfile", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["careerMatches", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["skillGap", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["validatedSkills", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["skillConfidenceSummary", variables.userId] }),
      ]);
    },
  });
}
