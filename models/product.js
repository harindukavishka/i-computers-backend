import mongoose, { model } from "mongoose";

const productSchema = new mongoose.Schema({
    productId : {
        type : String,
        required : true,
        unique : true   
    },
    name : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    altNames : {
        type : [String],
        default : []
    },
    price : {
        type : Number,
        required : true
    },
    labledPrice : {
        type : Number
    },
    category : {
        type : String,
        default : "Others"
    },
    images : {
        type : [String],
        default : ["/images/default-product-1.png", "/images/default-product-2.png"]
    },
    isVisible : {
        type : Boolean,
        default : true,
        required : true
    },
    brand : {
        type : String,
        default : "Generic"
    },
    model : {
        type : String,
        default : "Standard"
    }
    
})

const Product = model("Product", productSchema)

export default Product;