import mongoose from "mongoose";

const { Schema, model } = mongoose;

const loginHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
      index: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "blocked", "logout", "refresh"],
      required: true,
      index: true,
    },
    failureReason: String,
    detectedSignals: {
      type: [String],
      default: [],
    },
    occurredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  },
);

export const LoginHistory = model("LoginHistory", loginHistorySchema);
