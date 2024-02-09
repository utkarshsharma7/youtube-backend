// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"


dotenv.config({
    path: './env'
})



connectDB()



/*
import express from "express"

const app = express()

 (async () => {
    try{
        await mongoose.connnect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", () => {
            console.log(("ERRRRR ", error));
            throw error
        })
        app.listen(process.env.PORT, () => {
            console.log(`App is listeninf on port ${process.env.PORT}`);
        })
    }
    catch (error){
        console.log("Error : " , error);
        throw error
    }
 })()

 */