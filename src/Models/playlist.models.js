import mongoose from "mongoose";

const playlistSchema=new mongoose.Schema({
    title:{
        type:String,    
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})
export const Playlist=mongoose.model("Playlist",playlistSchema);
    