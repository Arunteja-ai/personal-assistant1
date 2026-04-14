export const startOfDay = (input = new Date()) => {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const addDays = (input, days) => {
  const date = new Date(input);
  date.setDate(date.getDate() + days);
  return date;
};

export const formatDayLabel = (input) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
  }).format(new Date(input));

export const formatMonthLabel = (input) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "2-digit",
  }).format(new Date(input));
