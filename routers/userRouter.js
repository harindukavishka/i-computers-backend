import express from "express";
import { createUser, getUser, loginUser, updatePassword, updateUser } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.get("/profile", getUser)
userRouter.post("/update-password", updatePassword)
userRouter.put("/", updateUser)

export default userRouter;