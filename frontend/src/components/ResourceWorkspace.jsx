import { useEffect, useMemo, useState } from "react";
import api, { getApiErrorMessage } from "../api/client";
import { EmptyState } from "./EmptyState";
import { MetricCard } from "./MetricCard";
import { SectionHeading } from "./SectionHeading";
import { DataTable } from "./tables/DataTable";
import { ModalForm } from "./forms/ModalForm";

const stringifyValue = (value) => (Array.isArray(value) ? value.join(", ") : value ?? "");

export const ResourceWorkspace = ({
  title,
  eyebrow,
  description,
  endpoint,
  fields,
  columns,
  filters = [],
  emptyState,
  initialValues,
  summary,
  createEnabled = true,
  editEnabled = true,
  extraActions,
  transformFormData,
  adminFlagging = false,
}) => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 8, totalPages: 1, total: 0 });
  const [query, setQuery] = useState({ search: "", page: 1, limit: 8 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint, { params: query });
      setItems(response.data.data);
      setMeta(response.data.meta);
      setError("");
    } catch (fetchError) {
      setError(getApiErrorMessage(fetchError, `Unable to load ${title.toLowerCase()}.`));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint, query.page, query.limit, query.search, JSON.stringify(filters.map((field) => query[field.name] ?? ""))]);

  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setModalOpen(false);
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete "${item.title || item.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`${endpoint}/${item._id}`);
      fetchItems();
    } catch (deleteError) {
      window.alert(getApiErrorMessage(deleteError, "Unable to delete the selected item."));
    }
  };

  const handleFlag = async (item) => {
    const nextFlag = !item.flagged;
    const reason =
      nextFlag && window.prompt("Why are you flagging this record?", item.flagReason || "")?.trim();

    try {
      await api.patch(`${endpoint}/${item._id}/flag`, {
        flagged: nextFlag,
        reason,
      });
      fetchItems();
    } catch (flagError) {
      window.alert(getApiErrorMessage(flagError, "Unable to update the flag status."));
    }
  };

  const handleSubmit = async (values) => {
    const payload = transformFormData ? transformFormData(values) : values;

    try {
      setSaving(true);
      if (editingItem) {
        await api.patch(`${endpoint}/${editingItem._id}`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      closeModal();
      fetchItems();
    } catch (submitError) {
      window.alert(getApiErrorMessage(submitError, "Unable to save your changes."));
    } finally {
      setSaving(false);
    }
  };

  const mappedFields = fields.map((field) => ({
    ...field,
    value: editingItem ? stringifyValue(editingItem[field.name]) : initialValues[field.name],
  }));

  const initialFormValues = useMemo(
    () =>
      fields.reduce((acc, field) => {
        if (editingItem) {
          acc[field.name] = stringifyValue(editingItem[field.name]);
        } else {
          acc[field.name] = initialValues[field.name];
        }

        return acc;
      }, {}),
    [editingItem, fields, initialValues],
  );

  const headerActions = (
    <>
      <input
        type="search"
        value={query.search}
        onChange={(event) =>
          setQuery((current) => ({
            ...current,
            page: 1,
            search: event.target.value,
          }))
        }
        className="field min-w-[220px]"
        placeholder={`Search ${title.toLowerCase()}...`}
      />

      {filters.map((filter) => (
        <select
          key={filter.name}
          value={query[filter.name] || ""}
          onChange={(event) =>
            setQuery((current) => ({
              ...current,
              page: 1,
              [filter.name]: event.target.value,
            }))
          }
          className="field min-w-[180px]"
        >
          <option value="">{filter.label}</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

      {createEnabled ? (
        <button
          type="button"
          onClick={openCreate}
          className="rounded-full bg-app-accent px-5 py-3 text-sm font-semibold text-white"
        >
          New {title.slice(0, -1)}
        </button>
      ) : null}
    </>
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={headerActions}
      />

      {summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          {summary(items, meta).map((card) => (
            <MetricCard key={card.label} {...card} />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[24px] border border-app-danger/20 bg-app-dangerSoft px-4 py-3 text-sm text-app-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[28px] border border-app-line bg-white/80 px-6 py-16 text-center text-sm text-app-muted">
          Loading {title.toLowerCase()}...
        </div>
      ) : items.length ? (
        <>
          <DataTable
            columns={columns}
            rows={items}
            emptyMessage={emptyState.description}
            actions={(row) => (
              <>
                {extraActions ? extraActions(row, fetchItems) : null}
                {editEnabled ? (
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="rounded-full border border-app-line px-3 py-2 text-xs text-app-muted"
                  >
                    Edit
                  </button>
                ) : null}
                {adminFlagging ? (
                  <button
                    type="button"
                    onClick={() => handleFlag(row)}
                    className="rounded-full border border-app-line px-3 py-2 text-xs text-app-muted"
                  >
                    {row.flagged ? "Unflag" : "Flag"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(row)}
                  className="rounded-full border border-app-danger/20 bg-app-dangerSoft px-3 py-2 text-xs text-app-danger"
                >
                  Delete
                </button>
              </>
            )}
          />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-app-muted">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} records)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() =>
                  setQuery((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1),
                  }))
                }
                className="rounded-full border border-app-line px-4 py-2 text-sm text-app-muted disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() =>
                  setQuery((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                className="rounded-full border border-app-line px-4 py-2 text-sm text-app-muted disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          action={
            createEnabled ? (
              <button
                type="button"
                onClick={openCreate}
                className="rounded-full bg-app-accent px-5 py-3 text-sm font-semibold text-white"
              >
                Create {title.slice(0, -1)}
              </button>
            ) : null
          }
        />
      )}

      <ModalForm
        open={modalOpen}
        title={`${editingItem ? "Edit" : "Create"} ${title.slice(0, -1)}`}
        fields={mappedFields}
        initialValues={initialFormValues}
        submitLabel={editingItem ? "Save Changes" : "Create"}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
};
