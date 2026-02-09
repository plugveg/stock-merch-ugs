import { usePaginatedQuery } from 'convex/react'

import { api } from '../../convex/_generated/api'

export const useUsersLite = (initialNumItems = 10) => usePaginatedQuery(api.users.listUsersLite, {}, { initialNumItems })
