import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";

export function useTasks() {
  const queryClient = useQueryClient();
  const convexQueryConfig = convexQuery(api.functions.tasks.get, {});

  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    ...convexQueryConfig,
    gcTime: 10000,
  });

  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => setShowSkeleton(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading]);

  const refetchTasks = () => {
    queryClient.invalidateQueries({ queryKey: convexQueryConfig.queryKey });
  };

  return {
    tasks: tasks ?? [],
    isLoading,
    showSkeleton,
    error,
    refetchTasks,
  };
}
