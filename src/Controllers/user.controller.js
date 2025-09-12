import asyncHandler from "../Utilities/aysncHandler.js";
import ApiError from "../Utilities/apiError.js"
import User from "../Models/user.models.js"
import uploadToCloudinary from "../Utilities/cloudinary.js";
import ApiResponse from "../Utilities/ApiResponce.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user= await User.findById(userId);
        if(!user){
            throw new ApiError(404,"User not found")
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
        
    } catch (error) {
        throw new ApiError(500,"Failed to generate access and refresh tokens.")
    }
}
const registerUser = asyncHandler(async (req, res, next) => {
    
    const { fullname,username, email, password } = req.body;
    if([fullname,username,email,password].some((field)=>
            !field || field?.trim()===""
        )
    ){
        throw new ApiError(400,"All field are required")
    }
    const existingUser= await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User that email or username already exists ")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image is required")
    }
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadToCloudinary(coverImageLocalPath) : null;

    if(!avatar){
        throw new ApiError(400,"avatar is required")
    }
    
    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || ""
    });

    const newUser = await User.findById(user._id).select(
        "-password -refreshToken "
    );

    if(!newUser){
        throw new ApiError(500,"User was not created successfully")
    }
    return res.status(201).json(new ApiResponse(201,newUser,"User created successfully"));

});

const loginUser=asyncHandler(async(req,res,next)=>{
    const {email,username,password}=req.body;
    if(!username && !email){
        throw new ApiError(400,"Email or username is required")
    }
    const user = await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid credentials")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
    return res.status(200).json(new ApiResponse(200,{accessToken,refreshToken},"User logged in successfully"));
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure:true,
    };
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:refreshToken,accessToken,loggedInUser},"User logged in successfully"));
    
});
const userLogOut=asyncHandler(async(req,res,next)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken:1
            },
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly: true,
        secure:true,
    }

    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(new ApiResponse(200,{},"User Logged Out"))

});

const accessRefreshToken=asyncHandler(async(req,res,next)=>{
    const incomingRefreshToken = req.body.refreshToken || req.cookies.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request,no refresh token")
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError(400,"Unauthorised request")
        }
    
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired")
        }
        const options ={
            httpOnly:true,
            secure:true
        }
        await generateAccessAndRefreshToken(user._id);
        return res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",refreshToken,options)
                .json(new ApiResponse(200,{accessToken,refreshToken},"Access and refresh tokens generated successfully"))
    } catch (error) {
        throw new ApiError(401,error.message || "Something went wrong,invalid refresh token")
    }
});

const changePassword=asyncHandler(async(req,res,next)=>{
    const {oldPassword,newPassword,confirmPassword}=req.body;

    if(!(newPassword===confirmPassword)){
        throw new ApiError(404,"Password is incorrect")
    }
    const user= await User.findById(req.user._id);
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invaild Password")
    }

    user.password=newPassword;
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed SuccessFully"))
});
const getCurrentUser=asyncHandler(async(req,res,next)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User Fetched SuccessFully"))
});

const updateAccountDetails=asyncHandler(async(req,res,next)=>{
    const {username,fullName,email}=req.body;

    if(!fullName||!username||!email){
        throw new ApiError(400,"All fields are required.")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email,
                username
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Account Details Updated Successfully,"));



})

const updateUserAvatar=asyncHandler(async(req,res,next)=>{
    const avatarLocalPath=req.file?.path;   
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }
    const avatar= await uploadToCloudinary(avatarLocalPath);
    if(!avatar.url){
        throw new ApiError(500,"Failed to upload avatar image")
    }
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {   
            $set:{
                avatar:avatar.secure_url
            }
        },
        {new:true}
    ).select("-password -refreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated successfully"));
    next(deleteOldAvatar);
});
const updateUserCoverImage=asyncHandler(async(req,res,next)=>{
    const coverImageLocalPath=req.file?.path;   
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image is required")
    }
    const coverImage= await uploadToCloudinary(coverImageLocalPath);
    if(!coverImage.url){
        throw new ApiError(500,"Failed to upload cover image")
    }
    const user= await User.findByIdAndUpdate(
        req.user._id,
        {   
            $set:{
                coverImage:coverImage.secure_url
            }
        },
        {new:true}
    ).select("-password -refreshToken");
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover image updated successfully"))
});
const getChannelProfile=asyncHandler(async(req,res,next)=>{
    const {username}=req.params;
    if(!username.trim()){
        throw new ApiError(400,"Username is required");
    }
    const channel =await User.aggregate([
        {
            $match:{
                username:username.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{$size:"$subscribers"},
                subscribedToCount:{$size:"$subscribedTo"},
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribedTo.subscriber"]},
                        then:true,
                        else:false
                    }
            }
        }
        },
        {
            $project:{
                fullName:1,
                username:1,
                avatar:1,
                subscriberCount:1,
                subscribedToCount:1,
                isSubscribed:1,
                coverImage:1,
                email:1
            }  
        }
    ])
    if(!channel||channel.length===0){
        throw new ApiError(404,"Channel not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,channel[0],"Channel profile fetched successfully"))
});

export {
    registerUser
    ,loginUser
    ,userLogOut
    ,accessRefreshToken
    ,changePassword
    ,getCurrentUser
    ,updateAccountDetails
    ,updateUserAvatar,
    getChannelProfile,

    };