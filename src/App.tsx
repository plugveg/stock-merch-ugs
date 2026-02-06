import { Routes, Route, Navigate } from 'react-router';
import { JSX, Suspense, lazy } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useCurrentUser } from './hooks/useCurrentUser';
import { Roles } from 'convex/schema';

const Home = lazy(() => import('./Home'));
const Products = lazy(() => import('./Products'));
const Dashboards = lazy(() => import('./Dashboards'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const UserDashboard = lazy(() => import('./UserDashboard'));

function RouteLoading() {
  return (
    <div
      aria-live="polite"
      role="status"
      style={{ textAlign: 'center', padding: '1em' }}
    >
      Chargement...
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoaded, isSignedIn } = useAuth();
  // While auth state is loading, render a loading indicator
  if (!isLoaded)
    return (
      <div
        aria-live="polite"
        role="status"
        style={{ textAlign: 'center', padding: '1em' }}
      >
        Chargement...
      </div>
    );
  return isSignedIn ? children : <Navigate to="/" replace />;
}

function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles: string[];
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { userInConvex } = useCurrentUser();

  // While auth state is loading, render a loading indicator
  if (!isLoaded)
    return (
      <div
        aria-live="polite"
        role="status"
        style={{ textAlign: 'center', padding: '1em' }}
      >
        Chargement...
      </div>
    );

  // Check if user is signed in first
  if (!isSignedIn) return <Navigate to="/" replace />;

  // Check if user has one of the required roles
  const userRole = userInConvex?.role as Roles;

  // If userRoles is undefined, we can't check roles, so deny access
  if (!userRole) {
    console.warn('User roles could not be determined');
    return <Navigate to="/dashboards" replace />;
  }

  const hasRequiredRole = allowedRoles.includes(userRole);

  return hasRequiredRole ? children : <Navigate to="/dashboards" replace />;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<RouteLoading />}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoading />}>
              <Products />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboards"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoading />}>
              <Dashboards />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboards/admin"
        element={
          <RoleProtectedRoute
            allowedRoles={['Administrator', 'Board of directors']}
          >
            <Suspense fallback={<RouteLoading />}>
              <AdminDashboard />
            </Suspense>
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboards/user"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteLoading />}>
              <UserDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
