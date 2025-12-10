import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createProduct(req,res){
   if(!isAdmin(req)){
    res.status(403).json({
        message : "Access denied, Admins only"
    });
    return;
   }

   try{

      const existingProduct = await Product.findOne({
         productId : req.body.productId
      })

      if(existingProduct){
         res.status(400).json({
            message : "Product with given productId is already exsist"
         })
         return;
      }

      const data = {};
      data.productId=req.body.productId;

      if(req.body.name == null){
         res.status(400).json({
            message : "Product name is required"
         })
         return;
      }
      data.name=req.body.name;
      data.description=req.body.description || "";
      data.altNames=req.body.altNames || [];

      if(req.body.price == null){
         res.status(400).json({
            message : "Price required"
         })
         return;
      }
      data.price=req.body.price;
      data.labledPrice=req.body.labledPrice || req.body.price;
      data.category=req.body.category || "others";
      data.images=req.body.images || ["/images/default-product-1.png", "/images/default-product-2.png"];
      data.isVisible=req.body.isVisible;
      data.brand=req.body.brand || "Generic";
      data.model=req.body.model || "Standard";

      const newProduct = new Product(data);
      await newProduct.save();
      res.status(200).json({
         message : "Product created successfully"
      })

   }catch(Error){

      res.status(500).json({message : "Error creating Product", error : Error})

   }
}

export async function getProduct(req,res){
   try{

      if(isAdmin(req)){
         const products = await Product.find();
         res.status(200).json(products)
      }else{
         const products = await Product.find({isVisible : true});
         res.status(200).json(products)
      }
      

   }catch(error){
      res.status(500).json({message : "Error Fetching data", error : error})
   }
}

export async function deleteProduct(req,res){
   try{

      if(!isAdmin(req)){
         res.status(403).json({
          message : "Access denied, Admins only"
         });
         return;
      }

      const productId = req.params.productId;
      await Product.deleteOne({productId : productId})
      res.status(200).json({message : "Product delete sucessfully"})

   }catch(error){
      res.status(500).json({message : "Error deleting product", error : error})
   }
}

export async function updateProduct(req,res){

   if(!isAdmin(req)){
    res.status(403).json({
        message : "Access denied, Admins only"
    });
    return;
   }

   try{
      const productId = req.params.productId;
      const data = {};

      if(req.body.name == null){
         res.status(400).json({
            message : "Product name is required"
         })
         return;
      }
      data.name=req.body.name;
      data.description=req.body.description || "";
      data.altNames=req.body.altNames || [];

      if(req.body.price == null){
         res.status(400).json({
            message : "Price required"
         })
         return;
      }
      data.price=req.body.price;
      data.labledPrice=req.body.labledPrice || req.body.price;
      data.category=req.body.category || "others";
      data.images=req.body.images || ["/images/default-product-1.png", "/images/default-product-2.png"];
      data.isVisible=req.body.isVisible;
      data.brand=req.body.brand || "Generic";
      data.model=req.body.model || "Standard";

      await Product.updateOne({productId : productId},data)
      res.status(200).json({
         message : "Product Updated successfully"
      })

   }catch(Error){

      res.status(500).json({message : "Error updating Product", error : Error})

   }
}

export async function getProductById(req,res){
   try{

      const productId = req.params.productId;
      const product = await Product.findOne({productId : productId})

      if(product == null){
         res.status(404).json({message : "Product not found"});
         return;
      }
      if(!product.isVisible){
         if(!isAdmin(req)){
            res.status(404).json({message : "Product not found"});
            return;
         }
      }
      res.status(200).json(product)

   }catch(Error){
      res.status(500).json({message : "Error fetching Product", error : Error})
   }
} 