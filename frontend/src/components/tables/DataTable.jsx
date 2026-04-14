import clsx from "clsx";

export const DataTable = ({
  columns,
  rows,
  emptyMessage,
  actions,
  compact = false,
}) => {
  if (!rows.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-app-line px-4 py-12 text-center text-sm text-app-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-app-line bg-white/80">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-app-line bg-app-bg/70">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-app-muted",
                    column.align === "right" && "text-right",
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.22em] text-app-muted">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row._id || row.id} className="border-b border-app-line/70 last:border-b-0">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx(
                      "px-4 py-4 align-top text-sm text-app-ink",
                      compact ? "py-3" : "py-4",
                      column.align === "right" && "text-right",
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key] ?? "N/A"}
                  </td>
                ))}

                {actions ? (
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">{actions(row)}</div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
