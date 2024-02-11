import { v2 as cloudinary } from "cloudinary";
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
        //file uploaded successfully
        console.log(("File is uploaded on cloudinary " , response.url));
        return response
    }
    catch(err){
        fs.unlinkSync(localFilePath);//delete local file after uploading to clodinary

        console.log("File upload error " , err);
        return null;
    }
}


// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );