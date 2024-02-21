import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    // 1. find channelId and subscriberId 
    // 2. check if both are correct or not
    // 3. check if user has already subscribed the channel or not
    // 4. If subscribed then unsubscribe otherwise subscribe the channel
    // 5 return response

    const userId = req.user?.id

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "channelId not correct")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "UserId not correct")
    }

    const existingSub = await  Subscription.findOne({
         subscriber: userId,
          channel : channelId
    })
    
    if(existingSub){
        const unsubs = await Subscription.findByIdAndDelete(existingSub._id);
        return res
        .status(200)
        .json(new ApiResponse(200, null , "Unsubscribed successfully"))
    }
    else{
        const subs = await Subscription.create({
          subscriber: userId,
          channel : channelId
        });
        return res
        .status(200)
        .json(new ApiResponse(200, subs, "Subscribed channel successfully"))
    }

    // const subscription = await Subscription.create({
    //   subscriber: req.user?._id,
    //   channel: channelId,
    // });



})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId || !isValidObjectId(channelId)) {
      throw new ApiError(400, 'Invalid Channel ID')
    }
    const subscribers = await Subscription.findById(channelId)

    return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscriber count fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId || !isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber Id")
    }
    const  subscribedChannels = await Subscription.find({subscriber: subscriberId}, 'channel').sort('-createdAt');

    return res
    .res(200)
    .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}