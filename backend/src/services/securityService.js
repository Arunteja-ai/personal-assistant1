import { LoginHistory } from "../models/LoginHistory.js";

export const getRequestMeta = (req) => ({
  ipAddress: (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim(),
  userAgent: req.headers["user-agent"] || "Unknown",
});

export const detectSuspiciousSignals = async ({ userId, email, ipAddress }) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [failedFromIp, failedForEmail, recentUserIps] = await Promise.all([
    LoginHistory.countDocuments({
      ipAddress,
      status: "failed",
      occurredAt: { $gte: oneHourAgo },
    }),
    LoginHistory.countDocuments({
      email,
      status: "failed",
      occurredAt: { $gte: oneHourAgo },
    }),
    userId
      ? LoginHistory.distinct("ipAddress", {
          userId,
          status: "success",
          occurredAt: { $gte: oneDayAgo },
        })
      : Promise.resolve([]),
  ]);

  const signals = [];

  if (failedFromIp >= 3) {
    signals.push("repeated_failed_attempts");
  }

  if (failedForEmail >= 5) {
    signals.push("credential_stuffing_pattern");
  }

  const nonEmptyIps = recentUserIps.filter(Boolean);
  if (nonEmptyIps.length >= 2 && ipAddress && !nonEmptyIps.includes(ipAddress)) {
    signals.push("multi_ip_rotation");
  }

  return signals;
};

export const recordLoginHistory = async (entry) => LoginHistory.create(entry);
