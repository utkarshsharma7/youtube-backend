import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = 1, // Ascending
    userId,
  } = req.query;

  // Converting string to integer
  page = Number.parseInt(page);
  limit = Number.parseInt(limit);

  // Validation
  if (!Number.isFinite(page)) {
    throw new ApiError(404, "Page number should be an integer");
  }

  if (!Number.isFinite(limit)) {
    throw new ApiError(404, "Video limit should be an integer");
  }

  // Getting user
  const user = await User.findOne({
    refreshToken: req.cookies.refreshToken,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Build the aggregation pipeline
  let aggregationPipeline = [
    {
      $match: { owner: user._id },
    },
    {
      $sort: {
        [sortBy]: sortType,
      },
    },
  ];

  // Add query-based filtering if a query is provided
  if (query && query.trim()) {
    aggregationPipeline[0].$match.title = {
      $regex: query.trim(),
      $options: "i",
    };
  }

  // Execute the aggregation pipeline
  const allVideos = await Video.aggregate(aggregationPipeline);

  if(!allVideos){
    throw new ApiError(404, "There are no videos to fetch")
  }
  // Paginate the results
  const videos = allVideos.slice((page - 1) * limit, page * limit);
  
  if (!videos) {
    throw new ApiError(404, "There are no videos to fetch");
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        numOfVideos: videos.length,
        videos,
      },
      "Fetched all videos"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if ([title, description].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required")
    }  

      let thumbnailLocalPath;
      if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path;
      } else {
        throw new ApiError(404, "thumbnail not found");
      }

      let videoLocalPath;
      if (req.files && req.files.videoFile && req.files.videoFile.length > 0) {
        videoLocalPath = req.files.videoFile[0]?.path;
      } else {
        throw new ApiError(404, "Video not found");
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
      isPublished: true,
      owner: req.user?._id,
    });

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
      if (!video || !video.isPublished) {
        throw new NotFoundError("This video does not exist or it's private.")
      }
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
  let thumbnailLocalPath;
  if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
    thumbnailLocalPath = req.files.thumbnail[0].path;

  } 

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  // 2. find the existing video using its ID
  const oldVideo = await Video.findById(videoId);

  // 3. If user does not own the video, send error response
  if (String(oldVideo.owner) !== String(req.user?._id)) {
    throw new ApiError(401, "You is not authorized to perform this action");
  }

  // 4. Update the fields of the video that are being updated
  oldVideo.title = title ? title : oldVideo.title;
  oldVideo.description = description ? description : oldVideo.description;
  oldVideo.thumbnail = thumbnail ? thumbnail : oldVideo.thumbnail;

  // 5. Save the updated video
  await oldVideo.save();

  return res
  .status(200)
  .json(new ApiResponse(200, oldVideo, "Video has been successfully updated"));
})

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    // 1. Find the video by its id
    const videoToBeDeleted = await Video.findById(videoId);

    // 2. If the video does not exist, send an error response
    if (!videoToBeDeleted) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "The video you want to delete was not found"
          )
        );
    }

    // 3. If the authenticated user does not own the video, send an error response
    if (String(videoToBeDeleted.owner) !== String(req.user._id)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "You are not authorized to delete this video"
          )
        );
    }

    // 4. Delete the video
    await videoToBeDeleted.deleteOne();

    // 5. Delete associated files from cloud storage (if any)
    if (videoToBeDeleted.thumbnail) {
      await deleteFromCloudinary(videoToBeDeleted.thumbnail);
    }
    if (videoToBeDeleted.videoFile) {
      await deleteFromCloudinary(videoToBeDeleted.videoFile);
    }

    // 6. Send a success response
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video deleted successfully"));
  } catch (err) {
    console.error("Error while deleting video:", err);
    // 7. Send an error response if any error occurs
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Error while deleting video"));
  }
});



const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if(!video) throw new ApiError(404, "No such video exists in our database.")

    video.isPublished = !video.isPublished;

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
