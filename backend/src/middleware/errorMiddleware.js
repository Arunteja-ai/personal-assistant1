import { ApiError } from "../utils/apiError.js";

const handleMongooseValidation = (error) => {
  const details = Object.values(error.errors || {}).map((entry) => entry.message);
  return new ApiError(400, "Validation failed.", details);
};

const handleDuplicateKey = (error) => {
  const field = Object.keys(error.keyPattern || {})[0];
  return new ApiError(409, `${field || "Record"} already exists.`);
};

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (error, _req, res, _next) => {
  let normalized = error;

  if (error.name === "ValidationError") {
    normalized = handleMongooseValidation(error);
  } else if (error.code === 11000) {
    normalized = handleDuplicateKey(error);
  } else if (!(error instanceof ApiError)) {
    normalized = new ApiError(500, error.message || "Internal server error.");
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  res.status(normalized.statusCode).json({
    message: normalized.message,
    details: normalized.details,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
