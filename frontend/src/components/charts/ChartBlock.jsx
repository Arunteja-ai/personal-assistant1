export const ChartBlock = ({ title, description, children }) => (
  <section className="rounded-[28px] border border-app-line bg-white/80 p-5">
    <div className="mb-5">
      <h3 className="font-display text-xl text-app-ink">{title}</h3>
      {description ? <p className="mt-2 text-sm text-app-muted">{description}</p> : null}
    </div>
    <div className="h-[280px]">{children}</div>
  </section>
);
