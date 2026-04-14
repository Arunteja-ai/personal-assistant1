export const SectionHeading = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-app-muted">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl text-app-ink">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-app-muted">{description}</p>
      ) : null}
    </div>

    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
  </div>
);
