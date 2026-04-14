import clsx from "clsx";

export const MetricCard = ({ label, value, hint, tone = "default" }) => (
  <div
    className={clsx(
      "rounded-[24px] border px-5 py-5",
      tone === "accent"
        ? "border-app-accent/20 bg-app-accentSoft"
        : tone === "warm"
          ? "border-app-warm/20 bg-app-warmSoft"
          : "border-app-line bg-white/80",
    )}
  >
    <p className="text-xs uppercase tracking-[0.24em] text-app-muted">{label}</p>
    <p className="mt-3 font-display text-3xl text-app-ink">{value}</p>
    {hint ? <p className="mt-2 text-sm text-app-muted">{hint}</p> : null}
  </div>
);
