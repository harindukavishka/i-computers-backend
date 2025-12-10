import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    email:{
        type : String,
        required : true,
        unique : true
    },

    firstName:{
        type : String,
        required : true
    },

    lastName:{
        type : String,
        required : true
    },

    password:{
        type : String,
        required : true
    },

    role:{
        type: String,
        required : true,
        enum : ["admin", "customer"],
        default : "customer"
    },

    isBlocked:{
        type : Boolean,
        reuired : true,
        default : false
    },

    isEmailVerified:{
        type : Boolean,
        required : true,
        default : false
    },

    image:{
        type : String,
        default : "images/default-profile.png"
    }

})

const User = mongoose.model("User", userSchema)

export default User;