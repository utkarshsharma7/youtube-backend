import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs"


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null

       const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        // console.log("response from cloudinary" , response);
        //file uploaded successfully
        // console.log(("File is uploaded on cloudinary " , response.url));
        fs.unlinkSync(localFilePath)
        return response
    }
    catch(err){
        fs.unlinkSync(localFilePath);//delete local file after uploading to clodinary

        console.log("File upload error " , err);
        return null;
    }
}

const deleteFromCloudinary = async (public_id, resource_type = "image") => {
  try {
    if(!public_id) return null;

   const result = await cloudinary.uploader.destroy(public_id, {
     resource_type: `${resource_type}`,
   });
    console.log(`File with public ID ${publicId} deleted from Cloudinary`);
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
