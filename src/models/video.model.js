import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from "bcrypt"


const videoSchema = new Schema({
    videoFile: {
        type: String, // cloudinary
        required: true
    },
    thumbnail: {
        type: String, // cloudinary
        required: true
    },
    title: {
        type: String, // cloudinary
        required: true
    },
    description: {
        type: String, // cloudinary
        required : true
    },
    duration: {
        type: Number, // cloudinary
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner :{
        type: Schema.Types.ObjectId,
        ref: "User"
    }


}, {timestamps: true})


// userSchema.pre("save", async function(next){
//     if(!this.isModified("password")){
//     return next()    
//     }
//     this.password =  bcrypt.hash(this.password, 10)
//     next()
// } )

// userSchema.methods.isPasswordCorrect = async function(password){
//     await bcrypt.compare(password, this.password).then((result)=>{
//        return result
//     })
// }
// videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)