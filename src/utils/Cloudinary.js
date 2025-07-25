import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath) => {
    try {
        if (!localPath)
            return null;
        const response = await cloudinary.uploader.upload(localPath,{
            resource_type : "auto",            
        })
        //file is uploaded successfully
        console.log("File is uploaded on cloudinary",response);
        fs.unlinkSync(localPath)
        return response //also try other properties like response.url
    } catch (error) {
        fs.unlinkSync(localPath) // removes the loaclly saved temp file if the upload fails        
    }
}


export {uploadOnCloudinary}