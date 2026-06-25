import User from "../models/user.js";
import bcrypt, { hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Otp from "../models/otp.js";
import nodemailer from "nodemailer";
import axios from "axios";

dotenv.config();

const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: "marvexharindu@gmail.com",
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

export function createUser(req,res){

    const hashPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({

        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : hashPassword

    })

    user.save().then(
        ()=>{
            res.json({
                message : "User added successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message : "User added failed"
            })
        }
    )

}

export function loginUser(req,res){

    User.findOne(
        {
            email: req.body.email
        }
    ).then(
        (user)=>{

            if(user.isBlocked){
                res.status(403).json({
                    message : "Your account is blocked.Please contact support pannel."
            })
            return
            }

           if(user == null){

                res.status(401).json(
                    {
                        message:"Given email with user not found"
                    }
                )

           }else{

            const isPasswordValid = bcrypt.compareSync(req.body.password, user.password)
            
            if(isPasswordValid){

                const token = jwt.sign(
                    {
                        email : user.email,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        role : user.role,
                        image : user.image,
                        isEmailVerified : user.isEmailVerified
                    },
                    process.env.JWT_SECRET,
                    {expiresIn: req.body.remeberme ? "30d" : "48h"}
                )

                console.log({
                        email : user.email,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        role : user.role,
                        image : user.image,
                        isEmailVerified : user.isEmailVerified
                });

                res.json({
                    message:"Login Successfully",
                    token : token,
                    role : user.role
                })
            }else{
                res.status(401).json({
                    message:"Invalid password"
                })
            }
           }
        }
    ).catch(
        ()=>{
            res.status(500).json
            ({
                message:"Internal server error"
            });
        }
    );

}

export function getUser(req,res){

    if(req.user == null){
        res.status(401).json({
            message:"Unauthorized"
        });
        return;
    }

    res.json({
        email : req.user.email,
        firstName : req.user.firstName,
        lastName : req.user.lastName,
        role : req.user.role,
        image : req.user.image,
        isEmailVerified : req.user.isEmailVerified
    })
}

export function isAdmin(req){
    if(req.user == null){
        return false;
    }
    if(req.user.role == "admin"){
        return true;
    }else{
        return false;
    }
}

export async function updateUser(req,res){
    if(req.user==null){
        res.status(404).json({
            message:"Unauthorized"
        });
        return;
    }
    try{

        await User.updateOne({email : req.user.email},{firstName : req.body.firstName, lastName : req.body.lastName, image: req.body.image});

        const user = await User.findOne({email : req.user.email});

        const token = jwt.sign(
            {
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                role : user.role,
                image : user.image,
                isEmailVerified : user.isEmailVerified
            },
            process.env.JWT_SECRET,
            {expiresIn: req.body.remeberme ? "30d" : "48h"}
        )

        res.status(200).json({
            message:"Profile updated successfully",
            token : token
        });

    }catch(Error){
        res.status(500).json({
            message:"Internal server error"
        });
    }
}

export async function updatePassword(req,res){
    if(req.user==null){
        res.status(404).json({
            message:"Unauthorized"
        });
        return;
    }
    try{

        const hashPassword = bcrypt.hashSync(req.body.password, 10);
        await User.updateOne({email : req.user.email},{password : hashPassword});
        res.status(200).json({
            message:"Password updated successfully"
        });

    }catch(Error){
        res.status(500).json({
            message:"Internal server error"
        });
    }
}

export async function sendOTP(req,res){
    try{
        const user = await User.findOne({email : req.body.email});
        if(user == null){
            res.status(404).json({
                message:"User not found"
            });
            return;
        }
        
        const otp = Math.floor(10000 + Math.random() * 90000);

        await Otp.deleteMany({email:req.body.email})
        
        const newOtp = new Otp({
            email : req.body.email,
            otp : otp
        })
        await newOtp.save();
        res.status(200).json({
            message:"OTP sent successfully"
        });
        const massege = {
            from: "marvexharindu@gmail.com",
            to : req.body.email,
            subject : "Your OTP for reset password",
            text : "Your OTP for password reset "+ otp +". Is valid for 10 min "
        }

        transporter.sendMail(massege, (error,info)=>{
            if(error){
                console.log("Error sending email", error)
                res.status(500).json({massege : "Error sending email", error : error})
            }else{
                console.log("Email send successfully", info.response)
                res.status(200).json({massege : "OTP sent successfully"})
            }
        })

    }catch(Error){
        res.status(500).json({
            message:"OTP sending failed",
            error: Error
            
        });
    }
}

export async function verifyOTP(req,res) {
    try{

        const otpCode = req.body.otp
        const email = req.body.email
        const newPassword = req.body.newPassword

        const otpRecord = await Otp.findOne({email:email})

        if(otpRecord == null){
            res.status(404).json({message:"OTP not found for the given email"})
            return
        }

        if(otpRecord.otp != otpCode){
            res.status(400).json({message:"Invalid OTP"})
            return
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword,10);
        await User.updateOne({email:email},{password:hashedNewPassword})
        await Otp.deleteOne({email:email})

        res.status(200).json({message:"Password reset successfully"})

    }catch(error){
       res.status(500).json({message:"Error verifing OTP", error:error})
       console.log(error)
    }
}

export async function googleLogin(req,res){
    try{

       const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
            headers : {
                Authorization : "Bearer " +req.body.token
            }
        })

        console.log(googleResponse.data)

        const user = await User.findOne({email : googleResponse.data.email})
        if(user == null){
            const newUser = new User({
                email : googleResponse.data.email,
                firstName : googleResponse.data.given_name,
                lastName : googleResponse.data.family_name,
                password : "googleLogin",
                image : googleResponse.data.picture,
                isEmailVerified : true
            })
            await newUser.save();
            cnsole.log("New user created")
            const token = jwt.sign(
                {
                    email : newUser.email,
                    firstName : newUser.firstName,
                    lastName : newUser.lastName,
                    role : newUser.role,
                    image : newUser.image,
                    isEmailVerified : newUser.isEmailVerified
                },
                process.env.JWT_SECRET
            )
            res.status(200).json({
                token : token,
                message : "Login successfully",
                role : newUser.role
            })
        }else{

            if(user.isBlocked){
                res.status(403).json({
                    message : "Your account is blocked.Please contact support pannel."
            })
            return
            }

            const token = jwt.sign(
                {
                    email : user.email,
                    firstName : user.firstName,
                    lastName : user.lastName,
                    image : user.image,
                    isEmailVerified : user.isEmailVerified
                },
                process.env.JWT_SECRET
            )
            res.status(200).json({
                token : token,
                message : "Login successfully",
                role : user.role
            })
        }

    }catch(error){
        res.status(500).json({message:"Error logging in with google", error : error})
        console.log(error)
    }
}

export async function getAllUsers(req,res){

    if(!isAdmin(req)){
        res.status(403).json({
            massege : "Forbidden"
        })
        return
    }

    try{

        const pageSizeInString = req.params.pageSize || "10";
        const pageSize = parseInt(pageSizeInString);
        const pageNumberInString = req.params.pageNumber || "1";
        const pageNumber = parseInt(pageNumberInString);
        const numberOfUsers = await User.countDocuments();
        const numberOfPages = Math.ceil(numberOfUsers/pageSize);
        const users = await User.find().sort({date : -1}).skip((pageNumber-1)*pageSize).limit(pageSize);
        res.status(200).json({users : users, totalPages : numberOfPages});



        
    }catch(error){
        res.status(500).json({message:"Error getting users", error : error})
        console.log(error)
    }
}

export async function blockedOrUnblockedUser(req,res) {
    if(!isAdmin(req)){
        res.status(403).json({
            massege : "Forbidden"
        })
        return
    }

    const email = req.body.email

    if(email == req.user.email){
        res.status(400).json({message:"You can't block or unblock yourself"})
        return
    }

    try{

        const user = await User.findOne({email : email})
        if(user == null){
            res.status(404).json({message:"User not found"})
            return
        }
        if(user.isBlocked){
            await User.updateOne({email : email},{isBlocked : false})
            res.status(200).json({message:"User unblocked successfully"})
        }else{
            await User.updateOne({email : email},{isBlocked : true})
            res.status(200).json({message:"User blocked successfully"})
        }
    }catch(error){
        res.status(500).json({message:"Error blocking or unblocking user", error : error})
        console.log(error)
    }
}

export async function changeRole(req,res) {
    if(!isAdmin(req)){
        res.status(403).json({
            massege : "Forbidden"
        })
        return
    }

    const email = req.body.email

    if(email == req.user.email){
        res.status(400).json({message:"You can't change your role"})
        return
    }

    try{

        const user = await User.findOne({email : email})
        if(user == null){
            res.status(404).json({message:"User not found"})
            return
        }
        if(user.role == "user"){
            await User.updateOne({email : email},{role : "admin"})
            res.status(200).json({message:"Role changed successfully"})
        }else{
            await User.updateOne({email : email},{role : "user"})
            res.status(200).json({message:"Role changed successfully"})
        }
    }catch(error){
        res.status(500).json({message:"Error changing role", error : error})
        console.log(error)
    }
}
