export const FieldRenderer = ({ field, value, onChange, error }) => {
  const commonProps = {
    id: field.name,
    name: field.name,
    className: "field",
    value:
      field.type === "checkbox"
        ? undefined
        : value ?? (field.type === "number" ? 0 : ""),
    onChange: (event) =>
      onChange(
        field.name,
        field.type === "checkbox" ? event.target.checked : event.target.value,
      ),
    placeholder: field.placeholder,
  };

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-app-ink">{field.label}</span>

      {field.type === "textarea" ? (
        <textarea {...commonProps} rows={field.rows || 4} />
      ) : field.type === "select" ? (
        <select {...commonProps}>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <div className="rounded-2xl border border-app-line bg-white px-4 py-3">
          <input
            type="checkbox"
            id={field.name}
            checked={Boolean(value)}
            onChange={commonProps.onChange}
          />
        </div>
      ) : (
        <input
          {...commonProps}
          type={field.type || "text"}
          min={field.min}
          step={field.step}
        />
      )}

      {error ? <p className="text-xs text-app-danger">{error}</p> : null}
    </label>
  );
};
