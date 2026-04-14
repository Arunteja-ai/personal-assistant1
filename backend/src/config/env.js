import dotenv from "dotenv";

dotenv.config();

const required = ["MONGO_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
};

const toNumber = (value, defaultValue) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const parseCsv = (value, fallbackValue) =>
  (value || fallbackValue || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const escapeRegex = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");

const compileOriginPattern = (pattern) =>
  new RegExp(`^${escapeRegex(pattern).replace(/\\\*/g, ".*")}$`);

const rawClientUrls = parseCsv(
  process.env.CLIENT_URLS,
  process.env.CLIENT_URL || "http://localhost:5173",
);
const rawClientUrlPatterns = parseCsv(process.env.CLIENT_URL_PATTERNS, "");

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  clientUrls: rawClientUrls,
  clientUrlPatterns: rawClientUrlPatterns.map(compileOriginPattern),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshTokenExpiresInDays: toNumber(
    process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS,
    14,
  ),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieSecure: toBoolean(process.env.COOKIE_SECURE, false),
  cookieSameSite:
    process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === "production" ? "none" : "lax"),
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};
