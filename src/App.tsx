import { Routes, Route, Navigate } from "react-router";
import Home from "./Home";
import Products from "./Products";
import { JSX } from "react";
import { useAuth } from "@clerk/clerk-react";
import Dashboards from "./Dashboards";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { Roles } from "convex/schema";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoaded, isSignedIn } = useAuth();
  // While auth state is loading, render a loading indicator
  if (!isLoaded)
    return (
      <div
        aria-live="polite"
        role="status"
        style={{ textAlign: "center", padding: "1em" }}
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
        style={{ textAlign: "center", padding: "1em" }}
      >
        Chargement...
      </div>
    );

  // Check if user is signed in first
  if (!isSignedIn) return <Navigate to="/" replace />;

  // Check if user has one of the required roles
  // Add proper null checking to prevent the TypeError
  const userRoles = userInConvex?.role as Roles | undefined;

  // If userRoles is undefined, we can't check roles, so deny access
  if (!userRoles) {
    console.warn("User roles could not be determined");
    return <Navigate to="/dashboards" replace />;
  }

  const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

  return hasRequiredRole ? children : <Navigate to="/dashboards" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboards"
        element={
          <ProtectedRoute>
            <Dashboards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboards/admin"
        element={
          <RoleProtectedRoute
            allowedRoles={["Administrator", "Board of directors"]}
          >
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboards/user"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
