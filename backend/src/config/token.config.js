import jwt from "jsonwebtoken";

const genToken = async (userId,phone) => {
    try {
        if(!process.env.JWT_SECRET){
            throw new error("jwt secret not available in dotenv file.");
            const token = await jwt.sign({userId,phone},process.env.JWT_SECRET,{expiresIn : "7d"});
            return token;
        }
    } catch (error) {
        console.log(`error genearting token,${error}`);
    }
}
export default genToken;