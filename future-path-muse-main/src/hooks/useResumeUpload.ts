import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadResume } from "../services/apiService";

/**
 * Custom React hook to upload a resume file.
 * Automatically invalidates relevant cache entries on success.
 */
export function useResumeUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, file }: { userId: number; file: File }) => uploadResume(userId, file),
    onSuccess: (_data, variables) => {
      // Invalidate all queries related to this user to trigger a fresh refetch of skills, career matches, gaps, and roadmaps
      queryClient.invalidateQueries({ queryKey: ["digitalTwin", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["careerMatches", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["skillGap", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["roadmap", variables.userId] });
    },
  });
}
