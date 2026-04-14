import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  buildSearchQuery,
  parseDateRange,
  parsePagination,
  parseSort,
  pickAllowedFilters,
  sanitizeUpdate,
  sendPaginatedResponse,
} from "../utils/query.js";

export const createCrudController = ({
  Model,
  searchFields = [],
  filterFields = [],
  sortFields = [],
  defaultSort = "-createdAt",
  dateField = "createdAt",
  allowedCreateFields = [],
  allowedUpdateFields = [],
  transformCreate,
  transformUpdate,
}) => ({
  list: asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort, sortFields, defaultSort);
    const query = {
      userId: req.user._id,
      ...buildSearchQuery(req.query.search, searchFields),
      ...pickAllowedFilters(req.query, filterFields),
      ...parseDateRange(req.query, dateField),
    };

    const [data, total] = await Promise.all([
      Model.find(query).sort(sort).skip(skip).limit(limit),
      Model.countDocuments(query),
    ]);

    sendPaginatedResponse({ res, data, total, page, limit });
  }),

  getOne: asyncHandler(async (req, res) => {
    const item = await Model.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      throw new ApiError(404, "Record not found.");
    }

    res.json({ data: item });
  }),

  create: asyncHandler(async (req, res) => {
    const cleanPayload = sanitizeUpdate(req.body, allowedCreateFields);
    const payload = transformCreate ? await transformCreate(cleanPayload, req) : cleanPayload;
    const item = await Model.create({
      ...payload,
      userId: req.user._id,
    });

    res.status(201).json({
      message: "Created successfully.",
      data: item,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const item = await Model.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      throw new ApiError(404, "Record not found.");
    }

    const changes = sanitizeUpdate(req.body, allowedUpdateFields);
    const transformed = transformUpdate
      ? await transformUpdate(changes, item, req)
      : changes;

    Object.assign(item, transformed);
    await item.save();

    res.json({
      message: "Updated successfully.",
      data: item,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!item) {
      throw new ApiError(404, "Record not found.");
    }

    res.json({
      message: "Deleted successfully.",
    });
  }),
});
