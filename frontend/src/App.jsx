import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminDataControlPage from "./pages/admin/AdminDataControlPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import DashboardPage from "./pages/user/DashboardPage";
import DailyLogsPage from "./pages/user/DailyLogsPage";
import GoalsPage from "./pages/user/GoalsPage";
import HabitsPage from "./pages/user/HabitsPage";
import NotesPage from "./pages/user/NotesPage";
import ProfilePage from "./pages/user/ProfilePage";
import TodosPage from "./pages/user/TodosPage";
import TransactionsPage from "./pages/user/TransactionsPage";

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg">
        <div className="panel px-8 py-10 text-center">
          <p className="font-display text-2xl text-app-ink">Preparing dashboard</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="todos" element={<TodosPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="daily-logs" element={<DailyLogsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AppShell admin />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserDetailPage />} />
          <Route path="data-control" element={<AdminDataControlPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
