import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req,res){

    if(req.user==null){
        res.status(401).json({message:"Unauthorized. please log in to place an order."})
        return
    }

    try{
        const orderData = {
            orderId : "ORD000001",
            firstName :req.body.firstName,
            lastName :req.body.lastName,
            addressLine1 :req.body.addressLine1,
            addressLine2 :req.body.addressLine2,
            city :req.body.city,
            country : "Sri Lanka",
            zipCode :req.body.zipCode,
            items : [],
            total: 0,
            phoneNo :req.body.phoneNo,
            email :req.user.email
        }

        if(orderData.firstName==""){
            orderData.firstName= req.user.firstName
        }
        if(orderData.lastName==""){
            orderData.lastName = req.user.lastName
        }
        if(orderData.addressLine1 == ""){
            res.status(400).json({message : "Address line 1 is required."})
            return
        }
        if(orderData.addressLine2 == ""){
            res.status(400).json({message : "Address line 2 is required."})
            return
        }
        if(orderData.city == ""){
            res.status(400).json({message : "City is required."})
            return
        }
        if(orderData.zipCode == ""){
            res.status(400).json({message : "Zipcode is required."})
            return
        }
        if(orderData.phoneNo == ""){
            res.status(400).json({message : "Phone number is required."})
            return
        }
        

        const lastOrder = await Order.findOne().sort({date : -1})
        
        if(lastOrder != null){
            const lastOrderId = lastOrder.orderId //"ORD000029"
            const lastOrderNumberInString = lastOrderId.replace("ORD","") //"000029"
            const lastOrderIdNumber = parseInt(lastOrderNumberInString)//29
            const newOrderIdNumber = lastOrderIdNumber + 1 //30
            const newOrderNumberInString = newOrderIdNumber.toString().padStart(6,"0") //"000030"
            orderData.orderId = "ORD"+newOrderNumberInString //"ORD000030"
        }

        for(let i = 0; i < req.body.items.length; i++){
            const item = req.body.items[i];
            const product = await Product.findOne({productId : item.productId});

            if(product == null){
                res.status(404).json({message : "Product with id "+item.productId+" not found.Remove it and try again."});
                return;
            }

            if(product.isVisible == false){
                res.status(404).json({message : "product with id"+item.productId+" not available in this moment.Remove it and try again."});
                return;
            }

            orderData.items.push({
                productId : product.productId,
                name : product.name,
                labledPrice : product.labledPrice,
                price : product.price,
                Image : product.images[1],
                qty : item.qty,
            });

            orderData.total += product.price * item.qty;
            
        }
        
        const order = new Order(orderData);
        await order.save();
        res.status(201).json({message : "Order created successfully"});

    }catch(Error){
        console.log(Error)
        res.status(500).json({message : "Error creating order", error : Error});
    }
}