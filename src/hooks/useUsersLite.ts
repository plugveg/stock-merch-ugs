import { api } from "../../convex/_generated/api";
import { usePaginatedQuery } from "convex/react";

export const useUsersLite = (initialNumItems = 10) =>
  usePaginatedQuery(api.users.listUsersLite, {}, { initialNumItems });
