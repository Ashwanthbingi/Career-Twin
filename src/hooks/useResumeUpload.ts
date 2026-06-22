import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadResume } from "../services/apiService";

export function useResumeUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      file,
      onProgress,
    }: {
      userId: number;
      file: File;
      onProgress?: (progress: number) => void;
    }) => uploadResume(userId, file, { onProgress }),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["digitalTwin", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["careerMatches", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["skillGap", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["validatedSkills", variables.userId] }),
        queryClient.invalidateQueries({ queryKey: ["currentResume", variables.userId] }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["digitalTwin", variables.userId], type: "active" }),
        queryClient.refetchQueries({
          queryKey: ["careerMatches", variables.userId],
          type: "active",
        }),
        queryClient.refetchQueries({ queryKey: ["skillGap", variables.userId], type: "active" }),
        queryClient.refetchQueries({ queryKey: ["roadmap", variables.userId], type: "active" }),
      ]);
    },
  });
}
