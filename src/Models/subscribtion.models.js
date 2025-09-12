import mongoose from "mongoose";

const subscribtionSchema= new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    Channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

const Subscribtion= mongoose.model("Subscribtion",subscribtionSchema);

export default Subscribtion;