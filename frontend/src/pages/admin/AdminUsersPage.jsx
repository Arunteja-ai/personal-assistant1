import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../../api/client";
import { MetricCard } from "../../components/MetricCard";
import { SectionHeading } from "../../components/SectionHeading";
import { StatusBadge } from "../../components/StatusBadge";
import { DataTable } from "../../components/tables/DataTable";
import { formatDate, formatDateTime } from "../../utils/formatters";

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState({ search: "", role: "", status: "", page: 1, limit: 10 });
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/admin/users", { params: query });
      setRows(response.data.data);
      setMeta(response.data.meta);
      setError("");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load users."));
    }
  };

  useEffect(() => {
    load();
  }, [query.page, query.search, query.role, query.status]);

  const updateStatus = async (user, status) => {
    await api.patch(`/admin/users/${user._id}/status`, { status });
    load();
  };

  const updateRole = async (user, role) => {
    await api.patch(`/admin/users/${user._id}/role`, { role });
    load();
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name} and all linked data?`)) {
      return;
    }

    await api.delete(`/admin/users/${user._id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="User Control"
        title="Search, inspect, and intervene on accounts"
        description="This table is meant to feel operational: search globally, filter by role or status, and take direct administrative action."
        actions={
          <>
            <input
              className="field min-w-[220px]"
              placeholder="Search users..."
              value={query.search}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, search: event.target.value }))}
            />
            <select
              className="field min-w-[180px]"
              value={query.role}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, role: event.target.value }))}
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="field min-w-[180px]"
              value={query.status}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, status: event.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Visible users" value={meta.total} hint="Matching the current search" tone="accent" />
        <MetricCard label="Admins in page" value={rows.filter((user) => user.role === "admin").length} hint="Admin accounts in current results" />
        <MetricCard label="Blocked in page" value={rows.filter((user) => user.status === "blocked").length} hint="Accounts currently suspended" tone="warm" />
      </div>

      {error ? (
        <div className="rounded-[24px] border border-app-danger/20 bg-app-dangerSoft px-4 py-3 text-sm text-app-danger">
          {error}
        </div>
      ) : null}

      <DataTable
        columns={[
          {
            key: "name",
            header: "User",
            render: (row) => (
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="mt-1 text-xs text-app-muted">{row.email}</p>
              </div>
            ),
          },
          { key: "role", header: "Role", render: (row) => <StatusBadge value={row.role} /> },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
          { key: "lastLoginAt", header: "Last Login", render: (row) => formatDateTime(row.lastLoginAt) },
          { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
        ]}
        rows={rows}
        emptyMessage="No users found."
        actions={(row) => (
          <>
            <button type="button" onClick={() => navigate(`/admin/users/${row._id}`)} className="rounded-full border border-app-line px-3 py-2 text-xs text-app-muted">
              View
            </button>
            <button type="button" onClick={() => updateStatus(row, row.status === "blocked" ? "active" : "blocked")} className="rounded-full border border-app-line px-3 py-2 text-xs text-app-muted">
              {row.status === "blocked" ? "Unblock" : "Block"}
            </button>
            <button type="button" onClick={() => updateRole(row, row.role === "admin" ? "user" : "admin")} className="rounded-full border border-app-line px-3 py-2 text-xs text-app-muted">
              {row.role === "admin" ? "Demote" : "Promote"}
            </button>
            <button type="button" onClick={() => deleteUser(row)} className="rounded-full border border-app-danger/20 bg-app-dangerSoft px-3 py-2 text-xs text-app-danger">
              Delete
            </button>
          </>
        )}
      />

      <div className="flex items-center justify-between text-sm text-app-muted">
        <p>
          Page {meta.page} of {meta.totalPages}
        </p>
        <div className="flex gap-2">
          <button type="button" disabled={meta.page <= 1} onClick={() => setQuery((current) => ({ ...current, page: Math.max(1, current.page - 1) }))} className="rounded-full border border-app-line px-4 py-2 disabled:opacity-50">
            Previous
          </button>
          <button type="button" disabled={meta.page >= meta.totalPages} onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))} className="rounded-full border border-app-line px-4 py-2 disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
