import { useQuery } from "@tanstack/react-query";
import { fetchCurrentResume } from "../services/apiService";

export function useCurrentResume(userId: number) {
  return useQuery({
    queryKey: ["currentResume", userId],
    queryFn: () => fetchCurrentResume(userId),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
