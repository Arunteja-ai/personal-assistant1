export const EmptyState = ({ title, description, action }) => (
  <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border border-dashed border-app-line bg-white/70 px-6 text-center">
    <h3 className="font-display text-2xl text-app-ink">{title}</h3>
    <p className="mt-3 max-w-md text-sm leading-6 text-app-muted">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);
