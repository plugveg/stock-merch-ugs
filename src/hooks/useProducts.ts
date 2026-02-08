import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
export interface UseProductsOptions {
  /**
   *  ID de l’utilisateur dont on veut afficher les produits.
   *  - undefined ➜ produits du user courant (logique serveur)
   *  - Id<"users">    ➜ produits de cet utilisateur (admin)
   */
  userId?: Id<'users'>
}

// Ajoute la pagination minimale attendue par listProducts (pageSize obligatoire).
const PAGE_SIZE = 10

export const useProducts = ({ userId }: UseProductsOptions = {}) => {
  /* ---------- Query ---------- */
  const productsQueryConfig = convexQuery(api.functions.products.listProducts, {
    pageSize: PAGE_SIZE,
    ...(userId ? { targetUserId: userId } : {}),
    // on laisse cursor undefined pour la première page
  })

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    ...productsQueryConfig,
    gcTime: 15_000,
  })

  // The API products.listProducts renvoie soit un tableau (quand codegen aura été ajusté)
  // soit { page, nextCursor }.  On normalise ici en un simple tableau.
  const hasPage = (data: unknown): data is { page: unknown } => typeof data === 'object' && data !== null && 'page' in data

  const products = Array.isArray(rawData) ? rawData : hasPage(rawData) ? rawData.page : []

  /* ---------- Cache invalidation helper ---------- */
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: productsQueryConfig.queryKey,
    })

  /* ---------- Mutations ---------- */
  const createFn = useConvexMutation(api.functions.products.create)
  const updateFn = useConvexMutation(api.functions.products.update)
  const deleteFn = useConvexMutation(api.functions.products.remove)

  const addProduct = useMutation({
    mutationFn: createFn,
    onSuccess: invalidate,
  })
  const updateProduct = useMutation({
    mutationFn: updateFn,
    onSuccess: invalidate,
  })
  const deleteProduct = useMutation({
    mutationFn: deleteFn,
    onSuccess: invalidate,
  })

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
  }
}

export default useProducts
