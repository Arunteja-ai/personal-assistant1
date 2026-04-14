import { AdminLog } from "../models/AdminLog.js";

export const recordAdminAction = async ({
  actor,
  action,
  targetType,
  targetId,
  targetLabel,
  metadata = {},
}) =>
  AdminLog.create({
    actorId: actor._id,
    actorEmail: actor.email,
    action,
    targetType,
    targetId: String(targetId),
    targetLabel,
    metadata,
  });
