import { StrictMode } from 'react'
import { frFR } from '@clerk/localizations'
import { BrowserRouter } from 'react-router'

import './index.css'
import { createRoot } from 'react-dom/client'
import { ConvexReactClient } from 'convex/react'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App.tsx'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)
const convexQueryClient = new ConvexQueryClient(convex)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: convexQueryClient.queryFn(),
      queryKeyHashFn: convexQueryClient.hashFn(),
    },
  },
})
convexQueryClient.connect(queryClient)

createRoot(document.getElementById('root')!).render(
  // React StrictMode helps identify potential problems in the application
  <StrictMode>
    {/* ClerkProvider sets up Clerk authentication and user context */}
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY} localization={frFR}>
      {/* ConvexProviderWithClerk ties Convex data client to Clerk auth state */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* QueryClientProvider supplies the React Query client for data fetching */}
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>
)
