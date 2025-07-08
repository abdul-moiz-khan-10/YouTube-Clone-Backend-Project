import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError"
import { Like } from "../models/like.model"
import { ApiResponse } from "../utils/ApiResponse"
import { Video } from "../models/video.model"
import { Tweet } from "../models/tweet.model.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    const likeVideo = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user?._id
        }
    )

    if (likeVideo) {
        await likeVideo.deleteOne()
        return res.status(200)
            .json(
                new ApiResponse(200, null, "Unliked video")
            )
    } else {
        const likedVideo = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        return res.status(200)
            .json(
                new ApiResponse(200, likedVideo, "liked video")
            )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "invalid Id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "comment not found")
    }

    const likeComment = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user?._id
        }
    )

    if (likeComment) {
        await likeComment.deleteOne()

        return res.status(200)
            .json(
                new ApiResponse(200, null, "Unliked comment")
            )
    } else {
        const likedComment = await Like.create({
            comment: commentId,
            likedBy: req.user?._id

        })

        return res.status(200)
            .json(
                new ApiResponse(200, likedComment, "liked comment")
            )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "invalid Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "tweet not found")
    }

    const likeTweet = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req.user?._id
        }
    )

    if (likeTweet) {
        const unlikeTweet = await likeTweet.deleteOne()
        return res.status(200)
            .json(
                new ApiResponse(200, unlikeTweet, "unliked tweet")
            )
    } else {
        const likedTweet = await Like.create(
            {
                tweet: tweetId,
                likedBy: req.user?._id
            }
        )
        return res.status(200)
            .json(
                new ApiResponse(200, likedTweet, "like tweet")
            )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate(
        [
            {
                $match:{
                    likedBy : new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideos",
                    pipeline:[
                        {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        username : 1,
                                    }
                                }
                            ]
                        },
                        {
                            $addFields:{
                                owner:{
                                    $first: "$owner"
                                }
                            }
                        },
                        {
                            $project:{
                                videoFile : 1,
                                thumbnail : 1,
                                duration : 1,
                                createAt : 1,
                                title : 1,
                                views : 1,
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    likedVideosCount:{
                        $size : "$likedVideos"
                    }
                }
            },
            {
                $project:{
                    likedVideos : 1,
                    likedVideosCount : 1
                }
            }
        ]
    )

    if(!likedVideos.length){
        throw new ApiError(404,"vides not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,likedVideos,"liked video fatch successfully")
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}