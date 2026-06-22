import { useQuery } from "@tanstack/react-query";
import { fetchRoadmap } from "../services/apiService";

/**
 * Custom React hook to fetch roadmap milestones for a user relative to a target role.
 * @param userId - The ID of the user.
 * @param targetRoleId - The ID of the target job role.
 */
export function useRoadmap(userId: number, targetRoleId: number) {
  return useQuery({
    queryKey: ["roadmap", userId, targetRoleId],
    queryFn: () => fetchRoadmap(userId, targetRoleId),
    enabled: !!userId && !!targetRoleId,
    staleTime: 1000 * 60 * 5,
  });
}
