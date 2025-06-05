import { useQuery } from "@tanstack/react-query";
import { Issue } from "@/types/Issue";
import issuesData from "@/data/issues.json";

const simulateDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const useIssues = () => {
  return useQuery({
    queryKey: ["issues"],
    queryFn: async (): Promise<Issue[]> => {
      await simulateDelay(500);
      return issuesData as Issue[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useIssue = (id: string | null) => {
  return useQuery({
    queryKey: ["issue", id],
    queryFn: async (): Promise<Issue | null> => {
      if (!id) return null;
      await simulateDelay(200);
      const issue = issuesData.find((issue) => issue.identifier === id);
      return issue || null;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
