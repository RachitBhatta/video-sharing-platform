import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    Video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    Owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }
},{timestamps:true})
commentSchema.plugin(mongooseAggregatePaginate);
export const Comment=mongoose.model("Comment",commentSchema);