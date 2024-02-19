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

const deleteFromCloudinary  = async(localFilePath ) => {
    try {
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.destroy(localFilePath, {
            resource_type: auto
        })
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("File deletion error on cloudinary", error);
        return null
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };
// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );