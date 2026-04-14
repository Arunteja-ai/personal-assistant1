import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { formatCurrency, formatDate } from "../../utils/formatters";

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/dashboard/summary");
        setData(response.data.data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, "Unable to load the dashboard summary."));
      }
    };

    load();
  }, []);

  if (!data) {
    return (
      <div className="rounded-[28px] border border-app-line bg-white/80 px-6 py-16 text-center text-sm text-app-muted">
        {error || "Loading dashboard overview..."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Command Overview"
        title="Personal performance at a glance"
        description="This workspace combines goals, execution, finance, and reflection into one daily operating surface."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Goals Completed" value={data.totals.completedGoals} hint="Finished goals in your system" tone="accent" />
        <MetricCard label="Open Todos" value={data.totals.openTodos} hint="Tasks still in motion" />
        <MetricCard label="Current Balance" value={formatCurrency(data.totals.currentBalance)} hint="Income minus expense this month" tone="warm" />
        <MetricCard label="Active Habits" value={data.totals.activeHabits} hint="Habits actively being tracked" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartBlock
          title="Weekly productivity pulse"
          description="Completed tasks and reflection cadence over the last seven days."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.productivitySeries}>
              <defs>
                <linearGradient id="todoFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#d9d2c6" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="todosCompleted"
                stroke="#0f766e"
                fill="url(#todoFill)"
                strokeWidth={2}
              />
              <Bar dataKey="logEntries" fill="#a16207" radius={[10, 10, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartBlock>

        <ChartBlock
          title="Six month money trend"
          description="Compare income and expense momentum without leaving the dashboard."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.financeSeries}>
              <CartesianGrid stroke="#d9d2c6" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#0f766e" radius={[10, 10, 0, 0]} />
              <Bar dataKey="expense" fill="#b42318" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
          <h3 className="font-display text-xl text-app-ink">Upcoming goals</h3>
          <div className="mt-5 space-y-3">
            {data.upcomingGoals.length ? (
              data.upcomingGoals.map((goal) => (
                <div key={goal._id} className="rounded-[22px] border border-app-line px-4 py-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-app-ink">{goal.title}</p>
                      <p className="mt-1 text-sm text-app-muted">{goal.category}</p>
                    </div>
                    <div className="text-sm text-app-muted">
                      Due {formatDate(goal.targetDate)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-app-muted">
                No target dates are scheduled yet. Add a goal deadline to surface planning risk.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
          <h3 className="font-display text-xl text-app-ink">Goal distribution</h3>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.goalBreakdown}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  fill="#0f766e"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
          <h3 className="font-display text-xl text-app-ink">Top habits</h3>
          <div className="mt-5 space-y-3">
            {data.topHabits.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between rounded-[22px] border border-app-line px-4 py-4">
                <div>
                  <p className="font-semibold text-app-ink">{habit.name}</p>
                  <p className="mt-1 text-sm text-app-muted">{habit.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-app-ink">{habit.streak}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-app-muted">day streak</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
          <h3 className="font-display text-xl text-app-ink">Recent notes</h3>
          <div className="mt-5 space-y-3">
            {data.recentNotes.map((note) => (
              <div key={note._id} className="rounded-[22px] border border-app-line px-4 py-4">
                <p className="font-semibold text-app-ink">{note.title}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-app-muted">{note.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
