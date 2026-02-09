import { useConvexAuth, useQuery } from 'convex/react'

import { api } from '../../convex/_generated/api'

export function useCurrentUser() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const userInConvex = useQuery(api.users.current)

  // Determine if the user query is still loading when authenticated
  const isUserQueryLoading = isAuthenticated && userInConvex === null

  // Combine the authentication state with the user existence check
  return {
    // The loading state remains true until both authentication and the user query are complete
    isAuthenticated: isAuthenticated && userInConvex !== null,
    isLoading: isLoading || isUserQueryLoading,
    userInConvex,
  }
}
