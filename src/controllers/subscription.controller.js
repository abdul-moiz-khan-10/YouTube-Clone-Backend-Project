import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "invalid channel Id")
    }

    if (channelId === req.user?._id.toString()) {
        throw new ApiError(400, "you not subscribed your own channels")
    }

    const subscription = await Subscription.findOne(channelId, req.user?._id)

    if (!subscription) {
        throw new ApiError(400, "Invalid channel Id")
    }

    if (subscription) {
        await subscription.deleteOne()
        return res.status(200)
            .json(
                new ApiResponse(200, "unsubscribed")
            )

    } else {
        await Subscription.create({
            channelId,
            subscriber: req.user?._id
        })
        return res.status(200).json(
            new ApiResponse(200, "subscribed")
        )
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$subscriberInfo" },
        { $replaceRoot: { newRoot: "$subscriberInfo" } }
    ])

    if(!subscribers.length){
        throw new ApiError(404,"Subscriber not found")
    }
    
    return res.status(200).json(
        new ApiResponse(200, subscribers, "User subscriber list fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "invalid subscriber Id")
    }

    const subscribed = await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channels"
        },
        {
            $replaceRoot: {newRoot: "$channels"}
        }
    ])

    if (!subscribed) {
        throw new ApiError(404, "No subscribed channels found for this user")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, subscribed, "Subscribed channels fetched successfully")
        )
})


export {
    toggleSubscription,
    getSubscribedChannels,
    getUserChannelSubscribers
}