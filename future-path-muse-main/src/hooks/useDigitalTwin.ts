import { useQuery } from "@tanstack/react-query";
import { fetchDigitalTwin } from "../services/apiService";

export function useDigitalTwin(userId: number) {
  return useQuery({
    queryKey: ["digitalTwin", userId],
    queryFn: () => fetchDigitalTwin(userId),
    staleTime: 1000 * 60 * 5,
  });
}
