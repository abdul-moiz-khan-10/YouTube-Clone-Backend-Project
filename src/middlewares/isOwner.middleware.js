import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isOwner = (Model) => asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid request");
    }

    const resource = await Model.findById(videoId);

    if (!resource) {
        throw new ApiError(404, "Resource Not Found");
    }

    if (userId.toString() !== resource.owner.toString()) {
        throw new ApiError(403, "You are not the owner of this resource");
    }

    next();
});