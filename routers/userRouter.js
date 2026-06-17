import express from "express";
import { createUser, getUser, googleLogin, loginUser, sendOTP, updatePassword, updateUser, verifyOTP } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.post("/sent-OTP",sendOTP)
userRouter.post("/verify-OTP",verifyOTP)
userRouter.post("/google-login", googleLogin)
userRouter.get("/profile", getUser)
userRouter.post("/update-password", updatePassword)
userRouter.put("/", updateUser)

export default userRouter; 

