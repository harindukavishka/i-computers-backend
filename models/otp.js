import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true
    },
    otp : {
        type : Number,
        required : true
    }
})

const Otp = mongoose.model("Otp",otpSchema)
export default Otp