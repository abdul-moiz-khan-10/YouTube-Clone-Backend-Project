import mongoose, { Schema, Types } from 'mongoose';

const videoViewsSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
})

export const VideoViews = mongoose.model('VideoViews', videoViewsSchema);