import { User } from "../models/User.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const profileFields = [
  "name",
  "title",
  "bio",
  "timezone",
  "currency",
  "avatarUrl",
  "preferences",
];

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ data: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};

  for (const field of profileFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    message: "Profile updated successfully.",
    data: user,
  });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    throw new ApiError(
      400,
      "Current password and a new password with at least 8 characters are required.",
    );
  }

  const user = await User.findById(req.user._id).select("+password");
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  user.password = newPassword;
  await user.save();

  res.json({
    message: "Password updated successfully.",
  });
});

export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await RefreshToken.find({
    userId: req.user._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort("-createdAt");

  res.json({ data: sessions });
});
