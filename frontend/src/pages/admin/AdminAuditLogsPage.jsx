import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../../api/client";
import { SectionHeading } from "../../components/SectionHeading";
import { DataTable } from "../../components/tables/DataTable";
import { formatDateTime } from "../../utils/formatters";

const AdminAuditLogsPage = () => {
  const [query, setQuery] = useState({ search: "", action: "", targetType: "", page: 1, limit: 10 });
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/admin/audit-logs", { params: query });
      setRows(response.data.data);
      setMeta(response.data.meta);
      setError("");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Unable to load audit logs."));
    }
  };

  useEffect(() => {
    load();
  }, [query.page, query.search, query.action, query.targetType]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Audit Trail"
        title="Every privileged action, preserved"
        description="Track who changed what, when they did it, and which system object was affected."
        actions={
          <>
            <input
              className="field min-w-[220px]"
              placeholder="Search audit trail..."
              value={query.search}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, search: event.target.value }))}
            />
            <input
              className="field min-w-[180px]"
              placeholder="Action filter"
              value={query.action}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, action: event.target.value }))}
            />
            <input
              className="field min-w-[180px]"
              placeholder="Target type"
              value={query.targetType}
              onChange={(event) => setQuery((current) => ({ ...current, page: 1, targetType: event.target.value }))}
            />
          </>
        }
      />

      {error ? (
        <div className="rounded-[24px] border border-app-danger/20 bg-app-dangerSoft px-4 py-3 text-sm text-app-danger">
          {error}
        </div>
      ) : null}

      <DataTable
        columns={[
          { key: "actorEmail", header: "Actor" },
          { key: "action", header: "Action" },
          { key: "targetType", header: "Target Type" },
          { key: "targetLabel", header: "Target" },
          { key: "createdAt", header: "Timestamp", render: (row) => formatDateTime(row.createdAt) },
        ]}
        rows={rows}
        emptyMessage="No audit entries matched your filters."
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

export default AdminAuditLogsPage;
