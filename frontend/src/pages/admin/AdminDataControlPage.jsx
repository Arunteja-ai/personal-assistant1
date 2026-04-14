import { useState } from "react";
import { ResourceWorkspace } from "../../components/ResourceWorkspace";
import { SectionHeading } from "../../components/SectionHeading";
import { adminResourceConfigs } from "../../utils/resourceConfigs";

const tabs = [
  { key: "goals", label: "Goals" },
  { key: "todos", label: "Todos" },
  { key: "transactions", label: "Transactions" },
  { key: "notes", label: "Notes" },
  { key: "habits", label: "Habits" },
  { key: "daily-logs", label: "Daily Logs" },
];

const AdminDataControlPage = () => {
  const [activeTab, setActiveTab] = useState("goals");

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Data Control"
        title="Cross-system record supervision"
        description="Inspect every goal, todo, transaction, note, habit, and daily log across the platform. Edit or delete any record and flag suspicious activity."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm ${
              activeTab === tab.key
                ? "bg-app-accent text-white"
                : "border border-app-line bg-white text-app-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ResourceWorkspace {...adminResourceConfigs[activeTab]} />
    </div>
  );
};

export default AdminDataControlPage;
