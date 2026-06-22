import { useQuery } from "@tanstack/react-query";
import { fetchSkillConfidenceSummary, fetchValidatedSkills } from "../services/apiService";

export function useValidatedSkills(userId: number) {
  return useQuery({
    queryKey: ["validatedSkills", userId],
    queryFn: () => fetchValidatedSkills(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSkillConfidenceSummary(userId: number) {
  return useQuery({
    queryKey: ["skillConfidenceSummary", userId],
    queryFn: () => fetchSkillConfidenceSummary(userId),
    staleTime: 1000 * 60 * 5,
  });
}
