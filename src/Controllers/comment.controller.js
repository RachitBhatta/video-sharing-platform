import mongoose, { isValidObjectId } from "mongoose"
import Comment from "../Models/comment.models.js"
import ApiErrors from "../Utilities/apiError.js"
import ApiResponse from "../Utilities/ApiResponce.js"
import asyncHandler from "../Utilities/aysncHandler.js"
import ApiError from "../Utilities/apiError.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;

    if(!isValidObjectId(videoId)){
        throw new ApiErrors(400, "Invalid video ID");
    };
    console.log("Video ID:", videoId, "Type:", typeof videoId); 
    const videoObjectId=new mongoose.Types.ObjectId(videoId);
    const comment = await Comment.aggregate([
        {
            $match:videoObjectId
        },
        {
            $lookup:{
                from:"videos",
                localField:"Video",
                foreignField:"_id",
                as:"CommentOnwhichVideo",
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"OwnerOfComment"
            }
        },{
            $project:{
                content:1,
                owner:{
                    $arrayElemAt:["$OwnerOfComment",0]
                },
                Video:{
                    $arrayElemAt:["Video",0]
                },
                createAt:1
            }
        },{
            $skip:(page-1)*parseInt(limit)
        },{
            $limit:parseInt(limit)
        }
    ]);

    if(!comment?.length){
        throw new ApiError(404,"Comment not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,comment,"Comment fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }