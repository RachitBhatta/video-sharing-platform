import mongoose from "mongoose";

const tweetSchema=new mongoose.Schema({
    content:{
        type:String,    
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Like"
    }],
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }]
},{timestamps:true})
export const Tweet=mongoose.model("Tweet",tweetSchema);
