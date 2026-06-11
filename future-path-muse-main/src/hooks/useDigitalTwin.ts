import { useQuery } from "@tanstack/react-query";
import { fetchDigitalTwin } from "../services/apiService";

/**
 * React hook to fetch digital twin data for a given userId.
 * Wraps TanStack Query's useQuery.
 *
 * @param userId - The ID of the user.
 */
export function useDigitalTwin(userId: number) {
  return useQuery({
    queryKey: ["digitalTwin", userId],
    queryFn: () => fetchDigitalTwin(userId),
    // Optional configuration details can be customized here (staleTime, gcTime, etc.)
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
