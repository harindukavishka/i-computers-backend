import User from "../models/user.js";
import bcrypt, { hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

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