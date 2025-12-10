import jwt from "jsonwebtoken"

export default function authorizedUser(req, res, next){
        const header = req.header("Authorization")
        
        if(header != null){
            const token = header.replace("Bearer ","")

            jwt.verify(token, "i-computers-54!", 
                (err, decoded)=>{
                   if(decoded == null){
                    res.status(401).json({
                        message : "Invalid token please login agin"
                    })
                   }else{
                    req.user=decoded;
                    next();
                   }
                }
            )
        }else{
            next();
        }

    }