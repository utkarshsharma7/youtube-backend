import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const comments = await Comment.aggregatePaginate(
      [
        {
          $match: {
            video: new mongoose.Types.ObjectId(videoId),
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
      ],
      {
        page,
        limit,
        collation: { locale: "en" },
      }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "comments fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while fetching comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  let { content } = req.body; // Declare content variable

  // Check if content is not provided or it's an object
  if (!content || typeof content !== "string") {
    throw new ApiError(400, "Content must be a string and is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "Failed to add comment please try again");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});


const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  // 1. finding the comment id
  // 2. checking if the owner is changing or not
  // 3. updating the comment



    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment?.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(400, "only comment owner can edit their comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      comment?._id,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    if (!updatedComment) {
      throw new ApiError(500, "Failed to edit comment please try again");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "Comment edited successfully")
      );

});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only comment owner can delete their comment");
  }

  await Comment.findByIdAndDelete(commentId);

  await Like.deleteMany({
    comment: commentId,
    likedBy: req.user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
