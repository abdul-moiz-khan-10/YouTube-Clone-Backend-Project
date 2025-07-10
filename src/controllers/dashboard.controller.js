import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"



const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const stats = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline:[
                    {
                        $lookup:{
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            totalLikes:{
                                $size : "$likes"
                            }
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalSubscribers: {
                    $size: "$subscribers"
                },
                totalVideosViews: {
                    $sum: "videos.views"
                },
                totalLikes: {
                    $sum : "videos.totalLikes"
                }
            }
        },
        {
            $project: {
                totalVideos : 1,
                totalSubscribers : 1,
                totalVideosViews : 1,
                totalLikes : 1
            }
        }
    ])

    if(!stats.length){
        throw new ApiError(404,"channel stats not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,stats[0],"Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    // const videos = await User.aggregate([
    //     {
    //         $match:{
    //             _id: new mongoose.Types.ObjectId(req.user?._id)
    //         }
    //     },
    //     {
    //         $lookup:{
    //             from: "videos",
    //             localField: "_id",
    //             foreignField: "owner",
    //             as: "videos",
    //             pipeline: [
    //                 {
    //                     $lookup: {
    //                         from: "likes",
    //                         localField: "_id",
    //                         foreignField: "video",
    //                         as: "likes"
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: "comments",
    //                         localField: "_id",
    //                         foreignField: "video",
    //                         as: "comments"
    //                     }
    //                 },
    //                 {
    //                     $addFields: {
    //                         likesCount: 
    //                         { 
    //                             $size: "$likes" 
    //                         },
    //                         commentsCount: 
    //                         { 
    //                             $size: "$comments" 
    //                         }
    //                     }
    //                 },
    //                 {
    //                     $project:{
    //                         title : 1,
    //                         views : 1,
    //                         createAt : 1,
    //                         thumbnail : 1,
    //                         videoFile : 1,
    //                         likesCount: 1,
    //                         commentsCount: 1,

    //                     }
    //                 }
    //             ]
    //         }
    //     },
    // ])

    const videos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from :"likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup:{
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields:{
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
            $project:{
                title : 1,
                views : 1,
                createdAt : 1,
                thumbnail : 1,
                videoFile : 1,
                likesCount: 1,
                commentsCount: 1    
            }
        }
    ])

    if(!videos.length){
        throw new ApiError(404, "No videos found for this channel")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}