import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api, { getApiErrorMessage } from "../../api/client";
import { ChartBlock } from "../../components/charts/ChartBlock";
import { MetricCard } from "../../components/MetricCard";
import { SectionHeading } from "../../components/SectionHeading";
import { DataTable } from "../../components/tables/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#0f766e", "#a16207", "#b42318", "#4c6fff", "#0f172a", "#7c3aed"];

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setData(response.data.data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, "Unable to load admin analytics."));
      }
    };

    load();
  }, []);

  if (!data) {
    return (
      <div className="rounded-[28px] border border-app-line bg-white/80 px-6 py-16 text-center text-sm text-app-muted">
        {error || "Loading admin command center..."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="System Command"
        title="Live SaaS oversight"
        description="Monitor users, security behavior, global financial movement, and feature adoption from one admin surface."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Users" value={data.totals.totalUsers} hint="All registered accounts" tone="accent" />
        <MetricCard label="Active Users" value={data.totals.activeUsers} hint="Seen in the last 7 days" />
        <MetricCard label="Transactions" value={data.totals.totalTransactions} hint="Global finance records" />
        <MetricCard label="Goals" value={data.totals.totalGoals} hint="Goals created across users" />
        <MetricCard label="Suspicious Logins" value={data.totals.suspiciousLogins} hint="Signals in the last 30 days" tone="warm" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartBlock title="User growth" description="New account creation volume across the last six months.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.userGrowth}>
              <CartesianGrid stroke="#d9d2c6" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="users" fill="#0f766e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBlock>

        <ChartBlock title="Login activity trend" description="Daily successful login volume across the last 30 days.">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.activityTrends}>
              <defs>
                <linearGradient id="loginArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#d9d2c6" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="logins" stroke="#0f766e" fill="url(#loginArea)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartBlock title="Transaction movement" description="Income versus expense across the last six months.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.transactionTrends}>
              <CartesianGrid stroke="#d9d2c6" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="income" fill="#0f766e" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expense" fill="#b42318" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBlock>

        <ChartBlock title="Feature usage" description="How much each product surface is being used across the system.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.featureUsage} dataKey="value" nameKey="name" outerRadius={90}>
                {data.featureUsage.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartBlock>
      </div>

      <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
        <h3 className="font-display text-xl text-app-ink">Most active users</h3>
        <div className="mt-5">
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
              { key: "score", header: "Activity Score", render: (row) => row.score },
            ]}
            rows={data.mostActiveUsers}
            emptyMessage="No user activity is available yet."
          />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
