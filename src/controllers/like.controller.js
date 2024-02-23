import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    
    if (!isValidObjectId(videoId)) throw new ApiError("Invalid video ID", 400)

    try{
        const existingLike = await Like.findOne({
            video: videoId,
            likedBy: req.user?._id,
        })
        if(existingLike){
             const unlike = await Like.findByIdAndDelete(existingLike._id);
             return res
             .status(200)
             .json(new ApiResponse(200, unlike, "Video unliked successfully"))
        }
        else{
            const like = await Like.create({
                video: videoId,
                likedBy: req.user?._id
            })
            return res
            .status(200)
            .json(new ApiResponse(200, like, "Video liked Successfully"))
        }
    }
    catch(error){
        console.log(error);
        throw new ApiError(500, "Error while toggle video like")
    }
    
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)) throw new ApiError( 400, "Invalid comment ID")

    try {
      const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
      });
      if (existingLike) {
         await Like.findByIdAndDelete(existingLike._id);

        return res
          .status(200)
          .json(new ApiResponse(200, null, "Comment Unliked successfully"));
      } else {
        const like = await Like.create({
          comment: commentId,
          likedBy: req.user._id,
        });
        return res
          .status(200)
          .json(new ApiResponse(201, like, "Comment Liked Successfully"));
      }
    } 
    catch (error) {
      console.log(error);
      throw new ApiError(500, "Error while toggle video like");
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Tweet Id")
    }

    try{
        const existingLike = await Like.findOne({
            tweet : tweetId,
            likedBy: req.user?._id
        })
        if(existingLike){
            const unlike = await Like.findByIdAndDelete(existingLike._id);

        return res
          .status(200)
          .json(new ApiResponse(200, null, "Comment Unliked successfully"));
        }
        else{
            const like = await Like.create({
          tweet : tweetId,
          likedBy: req.user._id,
        });
        return res
          .status(200)
          .json(new ApiResponse(201, like, "Tweet Liked Successfully"));
        }
    }
    catch(error){
        console.log("Error in toggling the tweet like", error);
        throw new ApiError(500, "Error in toggling the tweet like");
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {likedBy: req.user?._id, video : { $exists: true}},
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            },
        },
        { $unwind : "$videoDetails"}, 
        {
            $project: {
                _id: 1,
                video : {
                    _id: "$videoDetails._id",
                    title: "$videoDetails.title",
                    videoFile : "$videoDetails.videoFile",
                    thumbnail: "$videoDetails.thumbnail",
                    description: "$videoDetails.description",
                    views : "$videoDetails.views"
                }
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(404, "There are no lied videos")
    }

    return res.
    status(200)
    .json(new ApiResponse(200, likedVideos, "liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}