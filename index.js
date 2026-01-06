import express from 'express'
import mongoose from "mongoose"
import userRouter from './routers/userRouter.js'
import productRouter from './routers/productRouter.js'
import authorizedUser from './lib/jwtMiddleware.js'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI).then(
    ()=>{
        console.log("Connected to the MongoDB")
    }
).catch(
    ()=>{
        console.log("Connection faild")
    }
)

const app = express()

app.use(express.json())

app.use(cors())

app.use(authorizedUser) 


app.use("/api/users", userRouter)

app.use("/api/product", productRouter)


app.listen(3000, ()=>{console.log("Server Started")})