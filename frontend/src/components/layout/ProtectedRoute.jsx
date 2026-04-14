import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-app-bg px-6">
    <div className="panel max-w-md px-8 py-10 text-center">
      <p className="font-display text-2xl text-app-ink">Loading workspace</p>
      <p className="mt-2 text-sm text-app-muted">
        Reconnecting your dashboard, sessions, and admin controls.
      </p>
    </div>
  </div>
);

export const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};
