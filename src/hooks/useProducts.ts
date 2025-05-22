import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export const useProducts = () => {
  const queryClient = useQueryClient();
  const convexQueryConfig = convexQuery(api.functions.products.list, {});

  // Data query
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    ...convexQueryConfig,
    gcTime: 10000,
  });

  // Skeleton loading state
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading]);

  // Refetch/invalidate
  const refetchProducts = () => {
    queryClient.invalidateQueries({
      queryKey: convexQueryConfig.queryKey,
    });
  };

  // Mutations via Convex
  const createFn = useConvexMutation(api.functions.products.create);
  const updateFn = useConvexMutation(api.functions.products.update);
  const deleteFn = useConvexMutation(api.functions.products.remove);

  const addProduct = useMutation({
    mutationFn: createFn,
    onSuccess: refetchProducts,
  });
  const updateProduct = useMutation({
    mutationFn: updateFn,
    onSuccess: refetchProducts,
  });
  const deleteProduct = useMutation({
    mutationFn: deleteFn,
    onSuccess: refetchProducts,
  });

  return {
    products: products ?? [],
    isLoading,
    showSkeleton,
    error,
    refetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };
};

export default useProducts;
