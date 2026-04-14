const numericFallback = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parsePagination = (query) => {
  const page = Math.max(1, numericFallback(query.page, 1));
  const limit = Math.min(50, Math.max(1, numericFallback(query.limit, 12)));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const parseSort = (sort, allowedSorts = [], defaultSort = "-createdAt") => {
  if (!sort) {
    return defaultSort;
  }

  if (!allowedSorts.length) {
    return sort;
  }

  const cleaned = sort.startsWith("-") ? sort.slice(1) : sort;
  return allowedSorts.includes(cleaned) ? sort : defaultSort;
};

export const buildSearchQuery = (search, fields = []) => {
  if (!search || !fields.length) {
    return {};
  }

  const regex = new RegExp(search.trim(), "i");
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

export const pickAllowedFilters = (source, allowedKeys = []) => {
  const filters = {};

  for (const key of allowedKeys) {
    if (source[key] !== undefined && source[key] !== "") {
      if (source[key] === "true") {
        filters[key] = true;
      } else if (source[key] === "false") {
        filters[key] = false;
      } else if (/^-?\d+(\.\d+)?$/.test(String(source[key]))) {
        filters[key] = Number(source[key]);
      } else {
        filters[key] = source[key];
      }
    }
  }

  return filters;
};

export const parseDateRange = (query, field = "createdAt") => {
  const range = {};

  if (query.from) {
    const from = new Date(query.from);
    if (!Number.isNaN(from.getTime())) {
      range.$gte = from;
    }
  }

  if (query.to) {
    const to = new Date(query.to);
    if (!Number.isNaN(to.getTime())) {
      range.$lte = to;
    }
  }

  return Object.keys(range).length ? { [field]: range } : {};
};

export const sendPaginatedResponse = ({
  res,
  data,
  total,
  page,
  limit,
  extra = {},
}) =>
  res.json({
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
    ...extra,
  });

export const sanitizeUpdate = (payload, allowedFields = []) => {
  const clean = {};

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      clean[field] = payload[field];
    }
  }

  return clean;
};
