import clsx from "clsx";
import { titleCase } from "../utils/formatters";

const tones = {
  active: "bg-app-accentSoft text-app-accent",
  admin: "bg-app-warmSoft text-app-warm",
  blocked: "bg-app-dangerSoft text-app-danger",
  completed: "bg-app-accentSoft text-app-accent",
  in_progress: "bg-app-warmSoft text-app-warm",
  planned: "bg-white text-app-muted",
  on_hold: "bg-app-dangerSoft text-app-danger",
  today: "bg-app-warmSoft text-app-warm",
  backlog: "bg-white text-app-muted",
  overdue: "bg-app-dangerSoft text-app-danger",
  low: "bg-white text-app-muted",
  medium: "bg-app-accentSoft text-app-accent",
  high: "bg-app-warmSoft text-app-warm",
  critical: "bg-app-dangerSoft text-app-danger",
  income: "bg-app-accentSoft text-app-accent",
  expense: "bg-app-dangerSoft text-app-danger",
  true: "bg-app-dangerSoft text-app-danger",
  false: "bg-app-accentSoft text-app-accent",
};

export const StatusBadge = ({ value }) => {
  const normalized = String(value);

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        tones[normalized] || "bg-white text-app-muted",
      )}
    >
      {titleCase(normalized)}
    </span>
  );
};
