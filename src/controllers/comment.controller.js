import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import mongoose from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query

    //pagination
    limit = Math.min(parseInt(limit) > 0 ? limit : 10, 25)
    page = parseInt(page) > 0 ? parseInt(page) : 1
    const skip = (page - 1) * limit

    // sorting 
    const sortField = sortBy === "createdAt" ? "createdAt" : "updatedAt"
    const sortOrder = sortType === "asc" ? 1 : -1
    const sort = { [sortField]: sortOrder }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                { $project: { username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "comment",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" },
                            likesCount: { $size: "$likes" }
                        }
                    },
                    {
                        $project: {
                            content: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            owner: 1,
                            likesCount: 1
                        }
                    },
                    { $sort: sort },
                    { $skip: skip },
                    { $limit: limit }
                ]
            }
        }
    ])

    if (!video.length) {
        throw new ApiError(404, "video not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, video[0].comments, "Comments fetched successfully")
        )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    const userId = req.user?._id

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "content are required")
    }

    const addComment = await Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    if (!addComment) {
        throw new ApiError(500, "something when wrong while creting a comment")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, addComment, "Comment add successfully")
        )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid id")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "content are required")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, comment, "comment updated successfully")
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid id")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, comment, "comment deleted successfully")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}