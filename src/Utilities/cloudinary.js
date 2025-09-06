import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { v2 as cloudinary } from 'cloudinary';




cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary=async(filePath)=>{
    try {
        if(!filePath) return null;
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type:'auto',

        })
        console.log("File uploaded to Cloudinary:", response.secure_url);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
}

export default uploadToCloudinary;