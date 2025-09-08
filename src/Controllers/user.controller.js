import asyncHandler from "../Utilities/aysncHandler.js";
import ApiError from "../Utilities/apiError.js"
import User from "../Models/user.models.js"
import uploadToCloudinary from "../Utilities/cloudinary.js";
import ApiResponse from "../Utilities/ApiResponce.js";
const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user= await User.findById(userId).then((user)=>{
            if(!user){
                throw new ApiError(404,"User not found")
            }
        });
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
        "-password -refreshToken -createdAt -updatedAt -role"
    );

    if(!newUser){
        throw new ApiError(500,"User was not created successfully")
    }
    return res.status(201).json(new ApiResponse(201,newUser,"User created successfully"));

});

const loginUser=asyncHandler(async(req,res,next)=>{
    const {email,username,password}=req.body;
    if(!(username || email)){
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
export {registerUser,loginUser,userLogOut};