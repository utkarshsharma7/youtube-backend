import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  // Define the options object for pagination and sorting
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: {},
  };

  // Apply sorting if sortBy and sortType are provided
  if (sortBy && sortType) {
    options.sort[sortBy] = sortType === "desc" ? -1 : 1;
  }

  // Define the query object for filtering based on userId or any other query parameter
  const videoQuery = {};
  if (userId) {
    videoQuery.userId = userId;
  }
  // You can add more filters based on other query parameters if needed

  try {
    // Fetch videos based on query, sort, pagination
    const videos = await Video.find(videoQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(options.sort)
      .exec();

    res.status(200)
    .json(new ApiResponse(200, ));
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Server error" });
  }
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if ([title, description].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required")
    }  

    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath){
      throw new ApiError(400, "Video is missing")
    }
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "thumbnail is missing");
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile.url) {
      throw new ApiError(400, "Error while uploading the video");
    }
    if (!thumbnail.url) {
      throw new ApiError(400, "Error while uploading the thumbnail");
    }

    const video = await Video.create({
      title,
      description,
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      duration: videoFile.duration,
      isPublished:  true,
      owner: req.user?._id
    })

    const uploadedVideo = await Video.findById(video._id)

    if(!uploadedVideo){
      throw new ApiError(500, "Failed to upload video")
    }
    return res
    .status(201)
    .json(new ApiResponse(200, uploadedVideo, "Video uploaded successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    // searching  for a video with this ID in DB
    try {
      const video = await Video.findById(videoId)

      return res
      .status(200)
      .json(new ApiResponse(200, video, "got the video"))
    } catch (error) {
      throw new ApiError(404, 'No video with this ID')
    }

})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  // 1. get title,description and thumbnail from req.body and req.files
  // 2. find the existing video using its ID
  // 3. If user does not own the video, send error response
  // 4. Update the fields of the video that are being updated
  // 5. Save the updated video
  // 6. Send back the updated video as the response

  // 1. get title,description and thumbnail from req.body and req.files

  const { title, description } = req.body;
  const thumbnailLocalPath = req.file.path;

  // 2. find the existing video using its ID
  const oldVideo = await Video.findById(videoId);

  // 3. If user does not own the video, send error response
  if (oldVideo.user != req.user._id) {
    throw new ApiError(401, "You is not authorized to perform this action");
  }

  // 4. Update the fields of the video that are being updated
  oldVideo.title = title ? title : oldVideo.title;
  oldVideo.description = description ? description : oldVideo.description;
  oldVideo.thumbnail = thumbnailLocalPath ? thumbnailLocalPath : oldVideo.thumbnail;

  // 5. Save the updated video
  await oldVideo.save();

  return res
  .status(200)
  .json(new ApiResponse(200, oldVideo, "Video has been successfully updated"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    // 1. Find the video by its id
    // 2. If user does not own the video, send error response
    // 3. Delete the video
    // 4. Send a success response

    
    try{
      const videoToBeDeleted = await Video.findByIdAndDelete(videoId);
      if (!videoToBeDeleted || videoToBeDeleted.user !== req.user._id) {
        throw new ApiError(404, 'The video you want to delete was not found or it does not belong to you')
      }
      if(videoToBeDeleted.thumbnail) await deleteFromCloudinary(videoToBeDeleted.thumbnail)
      if(videoToBeDeleted.videoFile) await deleteFromCloudinary(videoToBeDeleted.videoFile)

      return res
      .status(200)
      .json(new ApiResponse(200, videoToBeDeleted, "Video deleted successfully"))


    }
    catch(err){
      throw new ApiError(500, "Error while deleting video")
      console.log(err);
    }
    

    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video) throw new ApiError(404, "No such video exists in our database.")

    video.isPublishedpublished = !video.isPublished;

    await video.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, video, "Publish status has been updated successfully."))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
