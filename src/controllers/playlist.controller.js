import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name){
        throw new ApiError(400, "Error in fetching name of video")
    }
    const playlist = await Playlist.create({
        name : name,
        description: description,
        video: [],
        owner : req.user?._id, 
    })

    return res
    .status(200)
    .json(new ApiResponse(200,playlist, "Created a playlist successfully." ))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User ID.")
    }
    const playlists = await Playlist.find({owner: userId})
    .populate("videos","username fullname avatar");

    if(!playlists){
        throw new ApiError(404, "No user playlist found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId){
        throw new ApiError(400, "No valid Playlist ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Error fetching playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const userId = req.user?._id;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist or video ID")
    }

    const playlist = await Playlist.findByIdAndUpdate({
        _id : playlistId,
        owner : userId
    },
    {
        $addToSet : {videos : videoId} ,
    },
    
    {new : true})

    return res
    .status(201)
    .json(new ApiResponse(201,playlist , "Video added to the playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    // find the playlist
    // remove the video 
    //  return the playlist

    const user = req.user?._id;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist or Video Id");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate({
        _id: playlistId,
        owner : user
    },
    {
        $pull : {video : videoId}
    },
    {new : true}
    )

    return res
    .status(201)
    .json(new ApiResponse(201,updatedPlaylist , "Video removed from the playlist successfully"));

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    // check if the user is the owner of the playlist
    // delete the playlist
    
    const user=req.user?._id;

    if(playlistId.owner !== user){
        throw new ApiError(403,'You do not have permission to perform this action');
        
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(201)
    .json(new ApiResponse(200,deletedPlaylist , 'Playlist has been deleted'));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    //check if the user owns the playlist 
    //update the playlist with the provided data

    const userId = req.user?._id;

    if(playlistId.owner != userId ){
        throw new ApiError(403,"You don't have access to this resource");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate({
        _id : playlistId,
        owner: userId
    },
    {
        name: name,
        description : description
    },
    {new : true})

    return res
      .status(201)
      .json(
        new ApiResponse(201, updatedPlaylist, "playlist updated successfully")
      );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
