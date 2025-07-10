import mongoose, { mongo } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    //TODO: create playlist

    if (
        [name, description].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field are required")
    }

    //const videos = await Video.findById(req.user?._id)
    const playlistExist = await Playlist.findOne({ name })

    if (playlistExist) {
        throw new ApiError(409, "same name playlist already exists")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while creating the playlist")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, playlist, "playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "invalid user Id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            owner: 1
                        }
                    }
                ]
                // pipeline: [
                //     {
                //         $lookup:{
                //             from: "users",
                //             localField: "owner",
                //             foreignField: "_id",
                //             as: "owner",
                //             pipeline: [
                //                 {
                //                     $project: {
                //                         username: 1,
                //                     }
                //                 }
                //             ]
                //         }

                //     },
                //     {
                //         $addFields:{
                //             owner:{
                //                 $first: "$owner"
                //             }
                //         }
                //     }
                // ]
            }
        },
        {
            $addFields: {
                videosCount: {
                    $size: "$videos"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                owner: 1,
                videosCount: 1,
                videos: 1
            }
        }
    ])

    if (!playlist.length) {
        throw new ApiError(404, "playlist not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, playlist, "playlist fetch successfully")
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "invalid Id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                                }
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
                            title: 1,
                            thumbnail: 1,
                            owner: 1,
                            duration: 1,
                            createdAt: 1,
                            videoFile: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videosCount: {
                    $size: "$videos"
                }
            }
        },
        {
            $project: {
                name: 1,
                owner: 1,
                videosCount: 1,
                videos: 1
            }
        }
    ])

    if (!playlist.length) {
        throw new ApiError(404, "playlist not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, playlist[0], "playlist fetch successfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "invalid Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const videoAdded = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet:
            {
                videos: videoId // $addToSet duplicate videos ko add nhi karenga 
            }
        },
        {
            new: true // new: true se updated document return hoga
        }
    )


    if(!videoAdded){
        throw new ApiError(404,"playlist not Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,videoAdded,"video added to playlist successfully")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if(!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"invalid Id")
    }
    
    const removeVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{
                videos : videoId // $pull array se videoId ko remove kar denga 
            }
        },
        {
            new:true
        }
    )

    if(!removeVideo){
        throw new ApiError(404,"playlist not Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,removeVideo,"removed Video to playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"invalid Id")
    }

    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletePlaylist){
        throw new ApiError(404,"playlist Not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,deletePlaylist,"Playlist Deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"invalid Id")
    }

    const updatedObj = {}

    if(name && name.trim() !== "" ) updatedObj.name = name
    if(description && description.trim() !== "") updatedObj.description = description

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set: updatedObj
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(404,"Playlist Not Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"Playlist Updated Successfully")
    )

})

export {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePlaylist,
    deletePlaylist,
    removeVideoFromPlaylist,
    addVideoToPlaylist
}