import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const content = req.body;
    const userId = req.user?._id;

    if(content.trim() === ""){
        throw new ApiError(400,"Content field cannot be empty");
    }else if (!isValidObjectId(userId)) {   
        throw new ApiError(401, 'you need to login to create tweets');
    }

    try{
        const tweet = await Tweet.create({
            content : content,
            owner : userId
        })
        if(!tweet){
            throw new ApiError(500,'Server error while creating the tweet')
        }

        return res
        .status(200)
        .json(new ApiResponse(200, tweet , "Tweet created successfully"))
    }
    catch(err){
        console.log(err);
        throw new ApiError(err.statusCode || 500, err.message||'Something went wrong while creating tweet')
    }



})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId  = req.user?._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User ID ")
    }

    
    const tweets = await Tweet.aggregate(
        [
            {$match: {owner: new mongoose.Types.ObjectId(userId)}},
            {$sort : {createdAt : -1}},
        ],
        { collation : {locale : "en"}}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const userId = req.user?._id;
    const tweetId = req.params;
    const newContent = req.body;

     if (newContent.trim() === "") {
       throw new ApiError(400, "content required");
     }

    if(!isValidObjectId(tweetId) || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID or tweet ID");
    }

    const tweetToBeUpdated = await Tweet.findById(tweetId);
    if (!tweetToBeUpdated) {
        throw new ApiError(404, 'No such tweet exists');
      }

    if (String(tweetToBeUpdated.owner) !== String(userId)) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action on this tweet"
      );
    }

    tweetToBeUpdated.content = newContent;
    await tweetToBeUpdated.save();

    return res
    .status(200)
    .json(new ApiResponse(200, tweetToBeUpdated, "Tweet updated Successfully"));
    


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const  userId = req.user?._id;
    const tweetId = req.params;

    if(!isValidObjectId(userId) || !isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid User Id or Tweet Id")
    }
    if(String(tweetId.owner) !== String(userId)){
        throw new ApiError(401,"User is not authorized to delete the tweet.")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"Deletion successful"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
