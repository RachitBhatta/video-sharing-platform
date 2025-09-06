import asyncHandler from "../Utilities/aysncHandler.js";
import ApiError from "../Utilities/apiError.js"
import User from "../Models/user.models.js"
import uploadToCloudinary from "../Utilities/cloudinary.js";
import ApiResponse from "../Utilities/ApiResponce.js";
const registerUser = asyncHandler(async (req, res, next) => {
    
    const { fullname,username, email, password } = req.body;
    if(
        [fullname,username,email,password].some((field)=>
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
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    if(coverImageLocalPath){
        throw new ApiError(400,"Cover image is required")
    }
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError("avatar is required")
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

export default registerUser;