import asyncHandler from "express-async-handler";
import ApiError from "../Utilities/apiError.js";
import jwt from "jsonwebtoken";
import User from "../Models/user.models.js";
export const verifyUser=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unauthorized request, token is missing")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select(
            "-password -refreshToken -createdAt -updatedAt -role"
        )
        if(!user){
            throw new ApiError(401,"Unauthorized request, user not found")
        }
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message ||"Unauthorized request, invalid token")
    }
});