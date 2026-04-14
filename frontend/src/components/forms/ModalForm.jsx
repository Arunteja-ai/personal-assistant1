import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { FieldRenderer } from "./FieldRenderer";

const validate = (fields, values) => {
  const errors = {};

  for (const field of fields) {
    const value = values[field.name];
    if (field.required && (value === "" || value === undefined || value === null)) {
      errors[field.name] = `${field.label} is required.`;
      continue;
    }

    if (field.type === "number" && field.min !== undefined && Number(value) < field.min) {
      errors[field.name] = `${field.label} must be at least ${field.min}.`;
    }
  }

  return errors;
};

export const ModalForm = ({
  open,
  title,
  fields,
  initialValues,
  submitLabel,
  onClose,
  onSubmit,
  loading,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues, open]);

  const gridClassName = useMemo(
    () =>
      clsx(
        "grid gap-4",
        fields.some((field) => field.fullWidth) ? "md:grid-cols-2" : "grid-cols-1",
      ),
    [fields],
  );

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(fields, values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    await onSubmit(values);
  };

  const setFieldValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-ink/35 px-4 py-6">
      <div className="panel w-full max-w-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-app-muted">Editor</p>
            <h3 className="mt-2 font-display text-2xl text-app-ink">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-app-line px-4 py-2 text-sm text-app-muted"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className={gridClassName}>
            {fields.map((field) => (
              <div
                key={field.name}
                className={clsx(field.fullWidth ? "md:col-span-2" : "md:col-span-1")}
              >
                <FieldRenderer
                  field={field}
                  value={values[field.name]}
                  onChange={setFieldValue}
                  error={errors[field.name]}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-app-line px-5 py-3 text-sm text-app-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-app-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
