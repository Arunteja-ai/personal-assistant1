import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../api/client";
import { MetricCard } from "../../components/MetricCard";
import { SectionHeading } from "../../components/SectionHeading";
import { DataTable } from "../../components/tables/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../utils/formatters";

const AdminSecurityPage = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [suspiciousLogins, setSuspiciousLogins] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [query, setQuery] = useState({ search: "", status: "", page: 1, limit: 8 });
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [historyResponse, suspiciousResponse, sessionsResponse] = await Promise.all([
        api.get("/admin/security/login-history", { params: query }),
        api.get("/admin/security/suspicious-logins"),
        api.get("/admin/security/sessions", { params: { page: 1, limit: 8 } }),
      ]);
      setLoginHistory(historyResponse.data.data);
      setMeta(historyResponse.data.meta);
      setSuspiciousLogins(suspiciousResponse.data.data);
      setSessions(sessionsResponse.data.data);
      setError("");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load security insights."));
    }
  };

  useEffect(() => {
    load();
  }, [query.page, query.search, query.status]);

  const revokeSession = async (sessionId) => {
    await api.delete(`/admin/security/sessions/${sessionId}`);
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Security Panel"
        title="Login telemetry, anomalies, and live sessions"
        description="Inspect raw login traffic, triage suspicious patterns, and revoke active refresh-token sessions."
        actions={
          <>
            <input
              className="field min-w-[220px]"
              placeholder="Search email, IP, or agent..."
              value={query.search}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, search: event.target.value }))}
            />
            <select
              className="field min-w-[180px]"
              value={query.status}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, status: event.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
              <option value="refresh">Refresh</option>
            </select>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Suspicious events" value={suspiciousLogins.length} hint="Latest anomaly rows returned" tone="warm" />
        <MetricCard label="Visible history rows" value={meta.total} hint="Matching current login history filter" />
        <MetricCard label="Active sessions" value={sessions.length} hint="Refresh-token sessions currently alive" tone="accent" />
      </div>

      {error ? (
        <div className="rounded-[24px] border border-app-danger/20 bg-app-dangerSoft px-4 py-3 text-sm text-app-danger">
          {error}
        </div>
      ) : null}

      <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
        <h3 className="font-display text-xl text-app-ink">Suspicious login patterns</h3>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {suspiciousLogins.length ? (
            suspiciousLogins.map((item) => (
              <div key={item._id} className="rounded-[22px] border border-app-line px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-app-ink">{item.email}</p>
                    <p className="mt-1 text-sm text-app-muted">{item.ipAddress || "Unknown IP"}</p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                <p className="mt-3 text-sm text-app-muted">
                  Signals: {item.detectedSignals.join(", ")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-app-muted">No suspicious login patterns detected in the latest sample.</p>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
        <h3 className="font-display text-xl text-app-ink">Login history</h3>
        <div className="mt-5">
          <DataTable
            columns={[
              {
                key: "email",
                header: "Identity",
                render: (row) => (
                  <div>
                    <p className="font-semibold">{row.email}</p>
                    <p className="mt-1 text-xs text-app-muted">{row.ipAddress || "Unknown IP"}</p>
                  </div>
                ),
              },
              { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
              { key: "detectedSignals", header: "Signals", render: (row) => row.detectedSignals?.join(", ") || "None" },
              { key: "occurredAt", header: "Occurred", render: (row) => formatDateTime(row.occurredAt) },
            ]}
            rows={loginHistory}
            emptyMessage="No login history matched this query."
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
        <h3 className="font-display text-xl text-app-ink">Active sessions</h3>
        <div className="mt-5">
          <DataTable
            columns={[
              {
                key: "userId",
                header: "User",
                render: (row) => (
                  <div>
                    <p className="font-semibold">{row.userId?.name || "Unknown"}</p>
                    <p className="mt-1 text-xs text-app-muted">{row.userId?.email || "N/A"}</p>
                  </div>
                ),
              },
              { key: "ipAddress", header: "IP", render: (row) => row.ipAddress || "Unknown" },
              { key: "createdAt", header: "Issued", render: (row) => formatDateTime(row.createdAt) },
              { key: "expiresAt", header: "Expires", render: (row) => formatDateTime(row.expiresAt) },
            ]}
            rows={sessions}
            emptyMessage="No active sessions are currently available."
            actions={(row) => (
              <button type="button" onClick={() => revokeSession(row._id)} className="rounded-full border border-app-danger/20 bg-app-dangerSoft px-3 py-2 text-xs text-app-danger">
                Revoke
              </button>
            )}
          />
        </div>
      </section>
    </div>
  );
};

export default AdminSecurityPage;
