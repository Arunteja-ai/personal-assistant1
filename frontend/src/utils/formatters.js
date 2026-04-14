export const formatCurrency = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDate = (value, options) => {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    options || {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
};

export const formatDateTime = (value) =>
  formatDate(value, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-IN", { notation: "compact" }).format(Number(value || 0));

export const titleCase = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
