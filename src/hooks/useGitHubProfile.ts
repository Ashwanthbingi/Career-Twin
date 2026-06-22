import { useQuery } from "@tanstack/react-query";
import { fetchGitHubProfile } from "../services/apiService";

export function useGitHubProfile(userId: number) {
  return useQuery({
    queryKey: ["githubProfile", userId],
    queryFn: () => fetchGitHubProfile(userId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
