import { useQuery } from "@tanstack/react-query";
import { fetchSkillGap } from "../services/apiService";

/**
 * Custom React hook to fetch skill gap details for a user relative to a target role.
 * @param userId - The ID of the user.
 * @param targetRoleId - The ID of the target job role.
 */
export function useSkillGap(userId: number, targetRoleId: number) {
  return useQuery({
    queryKey: ["skillGap", userId, targetRoleId],
    queryFn: () => fetchSkillGap(userId, targetRoleId),
    enabled: !!userId && !!targetRoleId,
    staleTime: 1000 * 60 * 5,
  });
}
