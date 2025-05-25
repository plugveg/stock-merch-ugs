import { Routes, Route, Navigate } from "react-router";
import Home from "./Home";
import Products from "./Products";
import { JSX } from "react";
import { useAuth } from "@clerk/clerk-react";

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
