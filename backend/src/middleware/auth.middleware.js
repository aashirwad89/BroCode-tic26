//Middleware = a gatekeeper that runs before your actual route logic

//Instead of checking JWT inside every API, you create one reusable layer.
import jwt from "jsonwebtoken";

const authMiddleware = (req,res,next) => {

// If authentication succeeds → next()
//If fails → send error response

    const header = req.header.authorization;
    //Reads the Authorization header from request.
    if(!header){
        return res.status(401).json({message : "user not authorized."});
    }
    //if no token is present in header than it signals unauthorized access and hence access is denied.
    const token = header.split(" ")[1];
    //it extracts token from header of request and seperates it with single spacing. here, [1] means token.
    try {
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        //comapres secret string present in token and dotenv, if valid then moves forward.
        req.user = decode;
        //now, attach extract user data from token like phone,userID and give it to decode. the authcontroller can directly use the user info and hence there is no need for it to again verify token.
        next();
        //moves forward.
    } catch (error) {
        return res.status(401).json({message:error});
    }
   
}
export default authMiddleware;