import api from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDate, titleCase } from "./formatters";

const splitTags = (value) =>
  String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const amountTone = (type) => (type === "income" ? "text-app-accent" : "text-app-danger");

const baseSummary = (label, valueAccessor, hintAccessor) => (items, meta) => [
  {
    label: "Visible Records",
    value: meta.total,
    hint: `Across ${titleCase(label)}`,
  },
  {
    label: "Highlighted",
    value: valueAccessor(items),
    hint: hintAccessor(items),
    tone: "accent",
  },
  {
    label: "Flagged",
    value: items.filter((item) => item.flagged).length,
    hint: "Items currently marked for review",
    tone: "warm",
  },
];

export const userResourceConfigs = {
  goals: {
    title: "Goals",
    eyebrow: "Progress Systems",
    description: "Track long-horizon objectives with status, target dates, and measurable progress.",
    endpoint: "/goals",
    emptyState: {
      title: "No goals yet",
      description: "Create your first target and start measuring momentum instead of relying on memory.",
    },
    initialValues: {
      title: "",
      description: "",
      category: "Career",
      priority: "medium",
      status: "planned",
      progress: 0,
      targetDate: "",
    },
    fields: [
      { name: "title", label: "Goal title", required: true },
      { name: "category", label: "Category" },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: ["low", "medium", "high"].map((value) => ({ value, label: titleCase(value) })),
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["planned", "in_progress", "completed", "on_hold"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
      { name: "progress", label: "Progress", type: "number", min: 0, step: 1 },
      { name: "targetDate", label: "Target date", type: "date" },
      { name: "description", label: "Description", type: "textarea", fullWidth: true },
    ],
    filters: [
      {
        name: "status",
        label: "All statuses",
        options: ["planned", "in_progress", "completed", "on_hold"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
      {
        name: "priority",
        label: "All priorities",
        options: ["low", "medium", "high"].map((value) => ({ value, label: titleCase(value) })),
      },
    ],
    columns: [
      {
        key: "title",
        header: "Goal",
        render: (item) => (
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-app-muted">{item.category}</p>
          </div>
        ),
      },
      { key: "status", header: "Status", render: (item) => <StatusBadge value={item.status} /> },
      { key: "priority", header: "Priority", render: (item) => <StatusBadge value={item.priority} /> },
      {
        key: "progress",
        header: "Progress",
        render: (item) => <span className="font-semibold">{item.progress}%</span>,
      },
      { key: "targetDate", header: "Target date", render: (item) => formatDate(item.targetDate) },
    ],
    transformFormData: (values) => ({
      ...values,
      progress: Number(values.progress || 0),
      targetDate: values.targetDate || null,
    }),
    summary: baseSummary(
      "goals",
      (items) => items.filter((item) => item.status === "completed").length,
      () => "Completed in the current view",
    ),
  },
  todos: {
    title: "Todos",
    eyebrow: "Execution Queue",
    description: "Manage your active execution list with priority, due dates, and completion state.",
    endpoint: "/todos",
    emptyState: {
      title: "No todos in motion",
      description: "Add a task and turn loose commitments into an operational queue.",
    },
    initialValues: {
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      dueDate: "",
      tags: "",
    },
    fields: [
      { name: "title", label: "Task title", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["backlog", "today", "completed", "overdue"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: ["low", "medium", "high", "critical"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
      { name: "dueDate", label: "Due date", type: "date" },
      { name: "tags", label: "Tags", placeholder: "meeting, finance, focus" },
      { name: "description", label: "Description", type: "textarea", fullWidth: true },
    ],
    filters: [
      {
        name: "status",
        label: "All statuses",
        options: ["backlog", "today", "completed", "overdue"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
      {
        name: "priority",
        label: "All priorities",
        options: ["low", "medium", "high", "critical"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
    ],
    columns: [
      {
        key: "title",
        header: "Task",
        render: (item) => (
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-app-muted">{item.tags?.join(", ") || "No tags"}</p>
          </div>
        ),
      },
      { key: "status", header: "Status", render: (item) => <StatusBadge value={item.status} /> },
      { key: "priority", header: "Priority", render: (item) => <StatusBadge value={item.priority} /> },
      { key: "dueDate", header: "Due", render: (item) => formatDate(item.dueDate) },
    ],
    transformFormData: (values) => ({
      ...values,
      dueDate: values.dueDate || null,
      tags: splitTags(values.tags),
    }),
    summary: baseSummary(
      "todos",
      (items) => items.filter((item) => item.status === "completed").length,
      () => "Completed in the current page",
    ),
  },
  transactions: {
    title: "Transactions",
    eyebrow: "Money Flow",
    description: "Track personal income and spending with category, payment method, and dates.",
    endpoint: "/transactions",
    emptyState: {
      title: "No transactions logged",
      description: "Capture money movement to keep your personal dashboard financially honest.",
    },
    initialValues: {
      title: "",
      type: "expense",
      amount: 0,
      category: "General",
      date: "",
      note: "",
      paymentMethod: "card",
    },
    fields: [
      { name: "title", label: "Transaction title", required: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: ["income", "expense"].map((value) => ({ value, label: titleCase(value) })),
      },
      { name: "amount", label: "Amount", type: "number", min: 0, required: true },
      { name: "category", label: "Category" },
      { name: "date", label: "Date", type: "date" },
      { name: "paymentMethod", label: "Payment method" },
      { name: "note", label: "Note", type: "textarea", fullWidth: true },
    ],
    filters: [
      {
        name: "type",
        label: "All types",
        options: ["income", "expense"].map((value) => ({ value, label: titleCase(value) })),
      },
    ],
    columns: [
      {
        key: "title",
        header: "Transaction",
        render: (item) => (
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-xs text-app-muted">{item.category}</p>
          </div>
        ),
      },
      { key: "type", header: "Type", render: (item) => <StatusBadge value={item.type} /> },
      {
        key: "amount",
        header: "Amount",
        render: (item) => (
          <span className={`font-semibold ${amountTone(item.type)}`}>
            {formatCurrency(item.amount)}
          </span>
        ),
      },
      { key: "date", header: "Date", render: (item) => formatDate(item.date) },
      { key: "paymentMethod", header: "Method", render: (item) => titleCase(item.paymentMethod) },
    ],
    transformFormData: (values) => ({
      ...values,
      amount: Number(values.amount || 0),
      date: values.date || null,
    }),
    summary: (items) => [
      {
        label: "Visible Volume",
        value: items.length,
        hint: "Transactions in the current query",
      },
      {
        label: "Income",
        value: formatCurrency(
          items.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0),
        ),
        hint: "Sum of visible income",
        tone: "accent",
      },
      {
        label: "Expense",
        value: formatCurrency(
          items.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0),
        ),
        hint: "Sum of visible expense",
        tone: "warm",
      },
    ],
  },
  notes: {
    title: "Notes",
    eyebrow: "Thought Capture",
    description: "Store ideas, reflections, and working notes without losing searchability or context.",
    endpoint: "/notes",
    emptyState: {
      title: "No notes captured",
      description: "Start a note to keep decisions, ideas, and reflections searchable inside the dashboard.",
    },
    initialValues: {
      title: "",
      content: "",
      mood: "reflective",
      tags: "",
      isPinned: false,
    },
    fields: [
      { name: "title", label: "Note title", required: true },
      {
        name: "mood",
        label: "Mood",
        type: "select",
        options: ["calm", "focused", "excited", "stressed", "reflective"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
      { name: "tags", label: "Tags" },
      { name: "isPinned", label: "Pin note", type: "checkbox" },
      { name: "content", label: "Content", type: "textarea", required: true, fullWidth: true, rows: 7 },
    ],
    filters: [
      {
        name: "mood",
        label: "All moods",
        options: ["calm", "focused", "excited", "stressed", "reflective"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
    ],
    columns: [
      {
        key: "title",
        header: "Note",
        render: (item) => (
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-app-muted">{item.content}</p>
          </div>
        ),
      },
      { key: "mood", header: "Mood", render: (item) => <StatusBadge value={item.mood} /> },
      { key: "isPinned", header: "Pinned", render: (item) => <StatusBadge value={item.isPinned} /> },
      { key: "updatedAt", header: "Updated", render: (item) => formatDate(item.updatedAt) },
    ],
    transformFormData: (values) => ({
      ...values,
      tags: splitTags(values.tags),
    }),
    summary: baseSummary(
      "notes",
      (items) => items.filter((item) => item.isPinned).length,
      () => "Pinned notes in the current view",
    ),
  },
  habits: {
    title: "Habits",
    eyebrow: "Consistency Engine",
    description: "Build routines, check in daily or weekly, and track streak resilience over time.",
    endpoint: "/habits",
    emptyState: {
      title: "No habits configured",
      description: "Create a repeatable behavior and let the dashboard track streak pressure and consistency.",
    },
    initialValues: {
      name: "",
      description: "",
      frequency: "daily",
      targetCount: 1,
      archived: false,
    },
    fields: [
      { name: "name", label: "Habit name", required: true },
      {
        name: "frequency",
        label: "Frequency",
        type: "select",
        options: ["daily", "weekly", "custom"].map((value) => ({ value, label: titleCase(value) })),
      },
      { name: "targetCount", label: "Target count", type: "number", min: 1 },
      { name: "archived", label: "Archived", type: "checkbox" },
      { name: "description", label: "Description", type: "textarea", fullWidth: true },
    ],
    filters: [
      {
        name: "frequency",
        label: "All frequencies",
        options: ["daily", "weekly", "custom"].map((value) => ({ value, label: titleCase(value) })),
      },
    ],
    columns: [
      {
        key: "name",
        header: "Habit",
        render: (item) => (
          <div>
            <p className="font-semibold">{item.name}</p>
            <p className="mt-1 text-xs text-app-muted">{item.description || "No description"}</p>
          </div>
        ),
      },
      { key: "frequency", header: "Frequency", render: (item) => titleCase(item.frequency) },
      { key: "streak", header: "Current streak", render: (item) => `${item.streak} days` },
      { key: "bestStreak", header: "Best streak", render: (item) => `${item.bestStreak} days` },
    ],
    transformFormData: (values) => ({
      ...values,
      targetCount: Number(values.targetCount || 1),
    }),
    summary: baseSummary(
      "habits",
      (items) => Math.max(0, ...items.map((item) => item.streak || 0)),
      () => "Longest streak in this view",
    ),
    extraActions: (row, refresh) => (
      <button
        type="button"
        onClick={async () => {
          await api.post(`/habits/${row._id}/check-in`);
          refresh();
        }}
        className="rounded-full bg-app-accentSoft px-3 py-2 text-xs font-semibold text-app-accent"
      >
        Check In
      </button>
    ),
  },
  "daily-logs": {
    title: "Daily Logs",
    eyebrow: "Reflection Stream",
    description: "Capture mood, focus, energy, and blockers so your dashboard reflects how the day actually felt.",
    endpoint: "/daily-logs",
    emptyState: {
      title: "No daily logs yet",
      description: "Create a daily reflection to reveal energy patterns and blockers across your week.",
    },
    initialValues: {
      date: "",
      mood: "steady",
      energy: 5,
      focus: 5,
      wins: "",
      blockers: "",
      gratitude: "",
    },
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      {
        name: "mood",
        label: "Mood",
        type: "select",
        options: ["great", "good", "steady", "low"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
      { name: "energy", label: "Energy", type: "number", min: 1, required: true },
      { name: "focus", label: "Focus", type: "number", min: 1, required: true },
      { name: "wins", label: "Wins", type: "textarea", fullWidth: true },
      { name: "blockers", label: "Blockers", type: "textarea", fullWidth: true },
      { name: "gratitude", label: "Gratitude", type: "textarea", fullWidth: true },
    ],
    filters: [
      {
        name: "mood",
        label: "All moods",
        options: ["great", "good", "steady", "low"].map((value) => ({
          value,
          label: titleCase(value),
        })),
      },
    ],
    columns: [
      { key: "date", header: "Date", render: (item) => formatDate(item.date) },
      { key: "mood", header: "Mood", render: (item) => <StatusBadge value={item.mood} /> },
      { key: "energy", header: "Energy", render: (item) => `${item.energy}/10` },
      { key: "focus", header: "Focus", render: (item) => `${item.focus}/10` },
    ],
    transformFormData: (values) => ({
      ...values,
      energy: Number(values.energy || 0),
      focus: Number(values.focus || 0),
    }),
    summary: baseSummary(
      "daily logs",
      (items) => items.reduce((sum, item) => sum + Number(item.energy || 0), 0),
      () => "Total energy score in this view",
    ),
  },
};

export const adminResourceConfigs = Object.entries(userResourceConfigs).reduce(
  (acc, [key, config]) => ({
    ...acc,
    [key]: {
      ...config,
      endpoint: `/admin/resources/${key}`,
      createEnabled: false,
      editEnabled: true,
      adminFlagging: true,
      columns: [
        ...config.columns,
        {
          key: "userId",
          header: "Owner",
          render: (item) => (
            <div>
              <p className="font-semibold">{item.userId?.name || "Unknown"}</p>
              <p className="mt-1 text-xs text-app-muted">{item.userId?.email || "N/A"}</p>
            </div>
          ),
        },
      ],
    },
  }),
  {},
);
