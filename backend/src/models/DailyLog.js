import mongoose from "mongoose";

const { Schema, model } = mongoose;

const dailyLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: ["great", "good", "steady", "low"],
      default: "steady",
    },
    energy: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    focus: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    wins: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    blockers: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    gratitude: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: String,
    flaggedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyLog = model("DailyLog", dailyLogSchema);
