import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import connectDB from "../db/index.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {
        await connectDB()
        return res.status(200).json(new ApiResponse(200, "OK", "Server is running"))
    } catch (error) {
        console.log(errer);
        throw  new ApiError(503, 'Service Unavailable', 'Database connection failed')
    }
})

export {
    healthcheck
    }
    