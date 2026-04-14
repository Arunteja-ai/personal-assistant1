import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

const userNav = [
  { to: "/app", label: "Dashboard", shortcut: "01" },
  { to: "/app/goals", label: "Goals", shortcut: "02" },
  { to: "/app/todos", label: "Todos", shortcut: "03" },
  { to: "/app/transactions", label: "Transactions", shortcut: "04" },
  { to: "/app/notes", label: "Notes", shortcut: "05" },
  { to: "/app/habits", label: "Habits", shortcut: "06" },
  { to: "/app/daily-logs", label: "Daily Logs", shortcut: "07" },
  { to: "/app/profile", label: "Profile", shortcut: "08" },
];

const adminNav = [
  { to: "/admin", label: "Overview", shortcut: "A1" },
  { to: "/admin/users", label: "Users", shortcut: "A2" },
  { to: "/admin/data-control", label: "Data Control", shortcut: "A3" },
  { to: "/admin/security", label: "Security", shortcut: "A4" },
  { to: "/admin/audit-logs", label: "Audit Logs", shortcut: "A5" },
];

export const AppShell = ({ admin = false }) => {
  const { user, logout } = useAuth();
  const navigation = admin ? adminNav : userNav;

  return (
    <div className="min-h-screen bg-app-bg px-4 py-4 md:px-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
        <Sidebar
          label={admin ? "Super Admin" : "Workspace"}
          title={admin ? "Control Plane" : "Assistant Hub"}
          description={
            admin
              ? "Monitor the full system, intervene on risky activity, and operate the platform like a live SaaS back office."
              : "Run your productivity, finances, habits, and notes from one calm operational surface."
          }
          items={navigation}
        />

        <main className="panel flex min-h-[80vh] flex-col overflow-hidden">
          <header className="flex flex-col gap-4 border-b border-app-line px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-app-muted">
                {admin ? "Administrative Command" : "Personal Operations"}
              </p>
              <h2 className="mt-1 font-display text-2xl text-app-ink">
                {user?.name}
              </h2>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <div className="rounded-full bg-app-accentSoft px-4 py-2 text-sm text-app-accent">
                {user?.role === "admin" ? "Role: Admin" : "Role: User"}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-app-line px-4 py-2 text-sm text-app-muted transition hover:border-app-accent hover:text-app-accent"
              >
                End Session
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 scrollbar-thin">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
