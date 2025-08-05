import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
    name : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
    },
    description : {
        type : String,
        trim : true,
    },
    videos : [
        {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video"
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
        
    },
    {timestamps: true},
);

export const PlayList = mongoose.model("PlayList", playlistSchema);
