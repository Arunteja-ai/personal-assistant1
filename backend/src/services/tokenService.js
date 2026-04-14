import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { ApiError } from "../utils/apiError.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const createAccessToken = (user) =>
  jwt.sign(
    {
      role: user.role,
      status: user.status,
      email: user.email,
      name: user.name,
    },
    env.jwtSecret,
    {
      subject: String(user._id),
      expiresIn: env.jwtExpiresIn,
    },
  );

export const issueRefreshToken = async ({ userId, ipAddress, userAgent }) => {
  const refreshToken = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(
    Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
  );

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    ipAddress,
    userAgent,
    expiresAt,
  });

  return refreshToken;
};

export const issueAuthTokens = async ({ user, ipAddress, userAgent }) => {
  const accessToken = createAccessToken(user);
  const refreshToken = await issueRefreshToken({
    userId: user._id,
    ipAddress,
    userAgent,
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (token) => {
  if (!token) {
    throw new ApiError(401, "Refresh token is required.");
  }

  const record = await RefreshToken.findOne({
    tokenHash: hashToken(token),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new ApiError(401, "Refresh token is invalid or expired.");
  }

  return record;
};

export const revokeRefreshToken = async (token) => {
  if (!token) {
    return;
  }

  await RefreshToken.updateOne(
    {
      tokenHash: hashToken(token),
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export const revokeRefreshTokenById = async (tokenId) => {
  await RefreshToken.findByIdAndUpdate(tokenId, {
    revokedAt: new Date(),
  });
};

export const revokeAllRefreshTokens = async (userId) => {
  await RefreshToken.updateMany(
    {
      userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export const rotateRefreshToken = async ({ token, userId, ipAddress, userAgent }) => {
  const existing = await verifyRefreshToken(token);

  if (String(existing.userId) !== String(userId)) {
    throw new ApiError(403, "Refresh token does not belong to this user.");
  }

  existing.revokedAt = new Date();
  existing.lastUsedAt = new Date();
  await existing.save();

  return issueRefreshToken({
    userId,
    ipAddress,
    userAgent,
  });
};

export const buildRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.cookieSecure || env.nodeEnv === "production",
  sameSite: env.cookieSameSite,
  domain: env.cookieDomain,
  path: "/api/auth",
  maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
});
