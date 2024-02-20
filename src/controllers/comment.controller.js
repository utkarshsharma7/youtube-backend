import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    try {
        const comments = await Comment.aggregatePaginate(
            [
                {$match : {
                    video : new mongoose.Types.ObjectId(videoId),
                }},
                {
                    $sort: {createdAt:-1}
                },
                {
                    $skip: (page-1) * limit
                },
                {
                    $limit: limit
                }

            ],
            {
                page, limit, collation: {locale: "en"}
            }
        );
        return res
        .status(200)
        .json(new ApiResponse(200, comments, "comments fetched successfully"))
    }
    catch(error){
        throw new ApiError(500, "Error while fetching comments")
    }
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    })

    if(!comment){
        throw new ApiError(400,"Failed to create the comment");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment,"Comment added"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    // 1. finding the comment id
    // 2. checking if the owner is changing or not
    // 3. updating the comment

    const {content} = req.body;
    const {commentId} = req.params;

    const comment = Comment.findById(commentId);

    if(comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(401, 'You do not have permission to perform this action');
        return;
    }
    
    comment.content = content;
    await comment.save();

    return res
    .status(200)
    .json(200, comment, "Comment updated successfully")
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const commentId = req.params;
    const  comment = await Comment.findByIdAndDelete(commentId.id);
    if (!comment) {
      throw new ApiError(404, 'Comment does not exist');
    }
  
    return res
    .status(200)
    .json(200, null, "Deleted comment");
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
