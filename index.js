import express from 'express'
import mongoose from "mongoose"
import userRouter from './routers/userRouter.js'
import productRouter from './routers/productRouter.js'
import authorizedUser from './lib/jwtMiddleware.js'



const mongoURI = "mongodb+srv://admin:1234@i-computers.0fcxc0y.mongodb.net/?appName=i-computers"

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

app.use(authorizedUser) 


app.use("/users", userRouter)

app.use("/product", productRouter)


app.listen(3000, ()=>{console.log("Server Started")})