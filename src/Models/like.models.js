import mongoose from "mongoose";

const likeSchema=new mongoose.Schema({
    Video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    Comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    },
    Tweet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet"
    },
    LikedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
export const Like=mongoose.model("Like",likeSchema);