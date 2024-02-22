import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id;

    if(!isValidObjectId(userId)) throw new ApiError("User not found or you are not logged in", 401);

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                subscriber : user._id,
            },
        },
        {
            $count : "subscribers",
        },

    ]);

    const videos = await Video.aggregate([
      {
        $match: {
            owner : user._id
        }
      },
      {
        $count : "videos",
      }
    ]);
    const likes = await Like.aggregate([
        {
            $match : {
                owner : user._id
            },
        },
        {
            $count : "likes"
        }
    ])

    const views  = await Video.aggregate([
        {
            $match: {owner : user._id}
        },
        {
            $group : {
                _id : null,
                totalViews : {
                    $sum : "$views"
                }
            }
        },
        {
            $project: {
            _id : 0,
            totalViews: 1,
        }}
    ])

    if(!subscribers){
        throw new ApiError(500, "Something went wrong while fetching subscriber count")
    }
    if (!videos) {
      throw new ApiError(
        500,
        "Something went wrong while fetching videos count"
      );
    }
    if (!likes) {
      throw new ApiError(
        500,
        "Something went wrong while fetching likes count"
      );
    }
    if (!views) {
      throw new ApiError(
        500,
        "Something went wrong while fetching views count"
      );
    }
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          subscribers: subscribers[0].subscribers,
          videos: videos[0].videos,
          likes: likes[0].likes,
          totalViews: views[0].totalViews,
        },
        "Successfuly fetched the channel statistics"
      )
    );
    
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id;
    if(!isValidObjectId(userId)){
        throw new ApiError(401, 'User not authenticated')
    }
    if(userId !== req.params.channelID){
        throw new ApiError(401, "Unauthorized Access");
    }
    const videos = await Video.find({
        owner : user._id
    })
    if(!video){
        throw new ApiError(401, "No videos on this channel or error fetching videos")
    }
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Fetched all videos successfuly"));

})

export {
    getChannelStats, 
    getChannelVideos
    }