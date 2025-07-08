import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/Cloudiary.js"
import { Video } from "../models/video.model.js"
import { VideoViews } from "../models/videoViews.model.js"
import mongoose from "mongoose"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pages = parseInt(page) > 0 ? parseInt(page) : 1 // page should be greater than 0
    const limits = Math.min(parseInt(limit) > 0 ? limit : 10, 50) // limit to 50 for performance
    const skip = (pages - 1) * limits

    //sorting logic
    const validSortFields = ["createdAt", "views", "title"]
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt"
    const sortOrder = sortType === "asc" ? 1 : -1
    const sortObj = {}
    sortObj[sortField] = sortOrder

    //filtering best on quary
    const filter = {}
    if (query) {
        filter.title = { $regex: query, $options: "i" }
    }

    if (userId) {
        filter.owner = userId
    }

    const videos = await Video.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                thumbnail: 1,
                videoFile: 1,
                createdAt: 1,
                views: 1,
                title: 1,
                owner: 1
            }
        },
        {
            $sort: sortObj
        },
        {
            $skip: skip
        },
        {
            $limit: limits
        }
    ]).option(
        {
            allowDiskUse: true // for large data set
        }
    )

    if (!videos.length) {
        throw new ApiError(404, "videos not found")
    }

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200)
        .json(
            new ApiResponse(200, {
                videos,
                pages,
                limits,
                totalVideos,
                totalPages: Math.ceil(totalVideos / limit)
            }, "videos fetched successfully")
        )

})

const publishAVideo = asyncHandler(async (req, res) => {

    // TODOs: 
    // get video,
    // validation - not empty
    // check for video, check for thumbnail  
    // upload to cloudinary, 
    // create video
    // create user objec - create entry in db
    // check for creation
    // return response

    const { title, description } = req.body

    // validation - not empty
    if (
        [title, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
    }

    //console.log("req.files : -> ",req.files)
    const thumbnailLocalPath = req.files?.thumbnail[0].path

    let videoFileLocalPath
    //check videao and validation
    if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files.videoFile[0].path
    } else {
        throw new ApiError(400, "Video is required")
    }
    //check thumbnail
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }

    //thumbnail and video, upload to cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)

    //console.log("video file : -> ",videoFile)

    //check 
    if (!(thumbnail && videoFile)) {
        throw new ApiError(400, "Thumbnail or video are required")
    }

    //create video in db
    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    // check for creation
    if (!video) {
        throw new ApiError(500, "Something went wrong while create the video")
    }

    //console.log("video object : ->",video)

    // return response
    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video Created Successfully")
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // console.log(videoId)
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const existVideo = await Video.findById(videoId)
    // check if video exist

    if (!existVideo) {
        throw new ApiError(404, "video does not exist")
    }

    // increment views
    const videoViews = await VideoViews.findOne({
        videoId: videoId,
        userId: req.user?._id
    })

    // check if user has already viewed the video
    if (!videoViews) {
        await VideoViews.create({
            videoId: videoId,
            userId: req.user?._id
        })
         await Video.findByIdAndUpdate(videoId, {
            $inc: { views: 1 }
        },
            {
                new: true
            }
        )
    }

    // increment views count
    // const existVideo = await Video.findByIdAndUpdate(videoId, {
    //     $inc: { views: 1 }
    // })

    // // if video not exist
    // if (!existVideo) {
    //     throw new ApiError(401, "video does not exist")
    // }


    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
                // pipeline: [
                //     {
                //         $lookup: {
                //             from: "users",
                //             localField: "owner",
                //             foreignField: "_id",
                //             as: "owner",
                //             pipeline: [
                //                 {
                //                     $project: {
                //                         username: 1,
                //                         avatar: 1,
                //                     }
                //                 }
                //             ]
                //         }
                //     },
                //     {
                //         $addFields: {
                //             owner: { $first: "$owner" }
                //         }
                //     }
                // ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videoOwner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoOwner:
                {
                    $first:
                        "$videoOwner"
                },
                likesCount:
                {
                    $size: "$likes"
                },
                commentsCount:
                {
                    $size: "$comments"
                }
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                createdAt: 1,
                videoOwner: 1, // video owner
                likesCount: 1,
                commentsCount: 1,
                // comments: 1,   // comments with owner
            }
        }
    ])

    //console.log(owner)
    if (!video?.length) {
        throw new ApiError(404, "video does not exists")
    }

    console.log("video ->", video[0])

    return res.status(200)
        .json(
            new ApiResponse(200, video[0], "Video fatch successfully")
        )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // const userId = req.user?._id 
    const { title, description } = req.body
    const thumbnailLocalPath = req.file?.path
    //TODO: update video details like title, description, thumbnail

    //check video Id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video Id")
    }

    const updateObj = {}
    //check title and description not a empty
    if (title && title.trim() !== "") updateObj.title = title
    if (description && description.trim() !== "") updateObj.description = description

    //check 
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail.url) {
            throw new ApiError(400, "Error while uploading on thumbnail")
        }
        updateObj.thumbnail = thumbnail.url
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: updateObj
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new ApiError(400, "video not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, video, " updated video details successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid video Id")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(404, "video not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, deletedVideo, "Video Delete successfully")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid Video Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (video.isPublished) {
        video.isPublished = false
        await video.save({ validateBeforeSave: false })
    } else {
        video.isPublished = true
        await video.save({ validateBeforeSave: false })
    }

    return res.status(200)
        .json(
            new ApiResponse(200, {
                isPublished: video.isPublished
            }, "change isPublish Status is successfully")
        )


})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}