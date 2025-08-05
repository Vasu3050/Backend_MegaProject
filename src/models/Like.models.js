import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy : {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: false, // optional for likes on comments
        },
        
        comment : {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            required: false, // optional for likes on videos
        },

        tweet : {
            type: Schema.Types.ObjectId,
            ref: "Tweet",
            required: false, // optional for likes on tweets
        }

    },
    {
        timestamps: true,
    },
);

export const Like = mongoose.model("Like", likeSchema);

