import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "../../api/client";
import { MetricCard } from "../../components/MetricCard";
import { SectionHeading } from "../../components/SectionHeading";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDate, formatDateTime } from "../../utils/formatters";

const listSection = (title, rows, renderTitle, renderMeta) => (
  <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
    <h3 className="font-display text-xl text-app-ink">{title}</h3>
    <div className="mt-5 space-y-3">
      {rows.length ? (
        rows.map((row) => (
          <div key={row._id} className="rounded-[22px] border border-app-line px-4 py-4">
            <p className="font-semibold text-app-ink">{renderTitle(row)}</p>
            <p className="mt-2 text-sm text-app-muted">{renderMeta(row)}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-app-muted">No recent records.</p>
      )}
    </div>
  </section>
);

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/admin/users/${id}`);
        setData(response.data.data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, "Unable to load user details."));
      }
    };

    load();
  }, [id]);

  if (!data) {
    return (
      <div className="rounded-[28px] border border-app-line bg-white/80 px-6 py-16 text-center text-sm text-app-muted">
        {error || "Loading user profile..."}
      </div>
    );
  }

  const { user, counts, recentActivity } = data;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="User Profile"
        title={user.name}
        description="Inspect identity, status, and recent behavior across every linked product surface."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-app-muted">Email</p>
              <p className="mt-2 text-sm text-app-ink">{user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-app-muted">Created</p>
              <p className="mt-2 text-sm text-app-ink">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-app-muted">Last Login</p>
              <p className="mt-2 text-sm text-app-ink">{formatDateTime(user.lastLoginAt)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-app-muted">Access</p>
              <div className="flex gap-2">
                <StatusBadge value={user.role} />
                <StatusBadge value={user.status} />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-[22px] border border-app-line bg-app-bg/50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-app-muted">Bio</p>
            <p className="mt-2 text-sm leading-6 text-app-ink">{user.bio || "No bio provided."}</p>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <MetricCard label="Goals" value={counts.goals} hint="Linked goal records" tone="accent" />
          <MetricCard label="Todos" value={counts.todos} hint="Task records" />
          <MetricCard label="Transactions" value={counts.transactions} hint="Finance records" tone="warm" />
          <MetricCard label="Notes" value={counts.notes} hint="Knowledge capture items" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {listSection(
          "Recent goals",
          recentActivity.goals,
          (row) => row.title,
          (row) => `${row.category} • ${row.status} • ${row.progress}% progress`,
        )}
        {listSection(
          "Recent todos",
          recentActivity.todos,
          (row) => row.title,
          (row) => `${row.priority} priority • ${row.status}`,
        )}
        {listSection(
          "Recent transactions",
          recentActivity.transactions,
          (row) => row.title,
          (row) => `${row.type} • ${row.category} • ${formatDate(row.date)}`,
        )}
        {listSection(
          "Recent notes",
          recentActivity.notes,
          (row) => row.title,
          (row) => row.content,
        )}
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
