import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshDigitalTwin } from "../services/apiService";

export function useRefreshDigitalTwin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => refreshDigitalTwin(userId),
    onSuccess: async (_data, userId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["digitalTwin", userId] }),
        queryClient.invalidateQueries({ queryKey: ["careerMatches", userId] }),
        queryClient.invalidateQueries({ queryKey: ["skillGap", userId] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap", userId] }),
      ]);

      await queryClient.refetchQueries({ queryKey: ["digitalTwin", userId], type: "active" });
    },
  });
}
