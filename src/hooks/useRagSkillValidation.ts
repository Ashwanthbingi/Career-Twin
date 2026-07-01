import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRagSkillValidation } from "../services/apiService";

export function useRagSkillValidation(userId: number, skillName: string) {
  return useQuery({
    queryKey: ["ragSkillValidation", userId, skillName],
    queryFn: () => fetchRagSkillValidation(userId, skillName),
    enabled: !!userId && !!skillName,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (skill validations are stable)
  });
}

export function useTriggerRagSkillValidation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, skillName }: { userId: number; skillName: string }) => 
      fetchRagSkillValidation(userId, skillName),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ragSkillValidation", variables.userId, variables.skillName] });
    },
  });
}
