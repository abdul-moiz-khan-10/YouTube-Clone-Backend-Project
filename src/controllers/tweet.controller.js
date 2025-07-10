import mongoose from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body

    if(!content || content.trim() === ""){
        throw new ApiError(400,"content are Requird")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet){
        throw new ApiError(500,"Something went wrong while create the content")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet Create Successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"likes"
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username : 1,
                            avatar : 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likeCount:{
                    $size:"$likes"
                },
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $project:{
                content : 1,
                likeCount : 1,
                owner : 1,
                createdAt : 1,
            }
        }
    ])

    if(!tweets.length){
        throw new ApiError(400,"no tweets found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,tweets,"User all tweets")
    )
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params
    const { content } = req.body

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"invalid content Id")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400,"content are requird")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true,
        }
    )

    if(!updatedTweet){
        throw new ApiError(404,"Tweet not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,updatedTweet,"Tweet updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const  { tweetId } = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"invalid tweet id")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deleteTweet){
        throw new ApiError(404,"tweet not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,deleteTweet,"Tweet Delated Successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
