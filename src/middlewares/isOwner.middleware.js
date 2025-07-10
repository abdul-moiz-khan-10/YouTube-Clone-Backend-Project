import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isOwner = (Model, paramName="id") => asyncHandler(async (req, res, next) => {
    // console.log("this is a params :- ",req.params[paramName]);
    const id = req.params[paramName];   
    const userId = req.user?._id;

    // console.log(tweetId)
    if (!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400, "Invalid request");
    }

    const resource = await Model.findById(id);

    if (!resource) {
        throw new ApiError(404, "Resource Not Found");
    }

    if (userId.toString() !== resource.owner.toString()) {
        throw new ApiError(403, "You are not the owner of this resource");
    }

    next();
});