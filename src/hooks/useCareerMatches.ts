import { useQuery } from "@tanstack/react-query";
import { fetchCareerMatches } from "../services/apiService";

/**
 * Custom React hook to fetch career matches for a user.
 * @param userId - The ID of the user.
 */
export function useCareerMatches(userId: number) {
  return useQuery({
    queryKey: ["careerMatches", userId],
    queryFn: () => fetchCareerMatches(userId),
    staleTime: 1000 * 60 * 5,
  });
}
