import mongoose from "mongoose";
import mongooseAggregationPaginate from "mongoose-aggregation-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content : {
            type : String,
            required : true,
            trim : true,
        },
        video : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video",
            required : true,
        },
        owner : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
        },
    },
    {timestamps : true},
);

commentSchema.plugin(mongooseAggregationPaginate);

export const Comment = mongoose.model("Comment", commentSchema);


