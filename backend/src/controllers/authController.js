import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";
import {
  buildRefreshCookieOptions,
  createAccessToken,
  issueAuthTokens,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  verifyRefreshToken,
} from "../services/tokenService.js";
import {
  detectSuspiciousSignals,
  getRequestMeta,
  recordLoginHistory,
} from "../services/securityService.js";
import { ROLES, USER_STATUS } from "../constants/roles.js";

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    ...buildRefreshCookieOptions(),
    maxAge: undefined,
  });
};

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, buildRefreshCookieOptions());
};

const validateCredentials = ({ name, email, password }) => {
  if (name !== undefined && name.trim().length < 2) {
    throw new ApiError(400, "Name must be at least 2 characters long.");
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "A valid email address is required.");
  }

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long.");
  }
};

const resolveBootstrapRole = async (email) => {
  if (env.adminEmails.includes(email.toLowerCase())) {
    return ROLES.ADMIN;
  }

  const adminCount = await User.countDocuments({ role: ROLES.ADMIN });
  return adminCount === 0 ? ROLES.ADMIN : ROLES.USER;
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  validateCredentials({ name, email, password });

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const role = await resolveBootstrapRole(email);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    role,
  });

  const requestMeta = getRequestMeta(req);
  const { accessToken, refreshToken } = await issueAuthTokens({
    user,
    ...requestMeta,
  });

  user.lastLoginAt = new Date();
  user.loginMetrics.successfulLogins += 1;
  await user.save();

  await recordLoginHistory({
    userId: user._id,
    email: user.email,
    ...requestMeta,
    status: "success",
    detectedSignals: [],
  });

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    message: "Account created successfully.",
    accessToken,
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateCredentials({ email, password });

  const requestMeta = getRequestMeta(req);
  const lowerEmail = email.toLowerCase();
  const user = await User.findOne({ email: lowerEmail }).select("+password");

  if (!user) {
    const signals = await detectSuspiciousSignals({
      email: lowerEmail,
      ...requestMeta,
    });
    await recordLoginHistory({
      email: lowerEmail,
      ...requestMeta,
      status: "failed",
      failureReason: "Account not found.",
      detectedSignals: signals,
    });
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.status === USER_STATUS.BLOCKED) {
    const signals = await detectSuspiciousSignals({
      userId: user._id,
      email: lowerEmail,
      ...requestMeta,
    });
    await recordLoginHistory({
      userId: user._id,
      email: lowerEmail,
      ...requestMeta,
      status: "blocked",
      failureReason: "Account is blocked.",
      detectedSignals: [...signals, "blocked_account_access"],
    });
    throw new ApiError(403, "This account is currently blocked.");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    user.loginMetrics.failedLogins += 1;
    await user.save();

    const signals = await detectSuspiciousSignals({
      userId: user._id,
      email: lowerEmail,
      ...requestMeta,
    });

    await recordLoginHistory({
      userId: user._id,
      email: lowerEmail,
      ...requestMeta,
      status: "failed",
      failureReason: "Incorrect password.",
      detectedSignals: signals,
    });

    throw new ApiError(401, "Invalid email or password.");
  }

  const signals = await detectSuspiciousSignals({
    userId: user._id,
    email: lowerEmail,
    ...requestMeta,
  });

  const { accessToken, refreshToken } = await issueAuthTokens({
    user,
    ...requestMeta,
  });

  user.lastLoginAt = new Date();
  user.loginMetrics.successfulLogins += 1;
  await user.save();

  await recordLoginHistory({
    userId: user._id,
    email: lowerEmail,
    ...requestMeta,
    status: "success",
    detectedSignals: signals,
  });

  setRefreshCookie(res, refreshToken);

  const safeUser = await User.findById(user._id);

  res.json({
    message: "Login successful.",
    accessToken,
    user: safeUser,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const record = await verifyRefreshToken(token);
  const user = await User.findById(record.userId);

  if (!user || user.status === USER_STATUS.BLOCKED) {
    throw new ApiError(403, "Unable to refresh session.");
  }

  const requestMeta = getRequestMeta(req);
  const nextRefreshToken = await rotateRefreshToken({
    token,
    userId: user._id,
    ...requestMeta,
  });

  await recordLoginHistory({
    userId: user._id,
    email: user.email,
    ...requestMeta,
    status: "refresh",
    detectedSignals: [],
  });

  setRefreshCookie(res, nextRefreshToken);

  res.json({
    accessToken: createAccessToken(user),
    user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (token) {
    await revokeRefreshToken(token);
  }

  clearRefreshCookie(res);

  if (req.user) {
    const requestMeta = getRequestMeta(req);
    await recordLoginHistory({
      userId: req.user._id,
      email: req.user.email,
      ...requestMeta,
      status: "logout",
      detectedSignals: [],
    });
  }

  res.json({ message: "Logged out successfully." });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllRefreshTokens(req.user._id);
  clearRefreshCookie(res);

  res.json({ message: "All sessions revoked successfully." });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
