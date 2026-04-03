import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import genToken from "../config/token.config.js";
import otpGenerator from "otp-generator";

export const genOtp = async (req,res) => {
    try {
        const {phone} = req.body;
        const otp = await otpGenerator.generate(4,{
            digits : true,
            lowerCaseAlphabets : false,
            upperCaseAlphabets : false,
            specialChars : false
        });
        const createOtp = await Otp.create({
            phone,
            otp,
            expiresAt : new Date(Date.now()+5*60*1000)
        });
        if(createOtp){
            console.log("otp stored in db..");
        }
        console.log("OTP:",otp);
        
    } catch (error) {
        console.log("cant generate otp",{error});
    }
};

export const verifyOtp = async (req,res) => {
    try {
        const {phone,otp} = req.body;
        const record = await Otp.findOne({phone,otp});
        if(!record){
            console.log("invalid otp");
            return res.status(404).json({message : "invalid otp"});
        }
        if(record.expiresAt < new Date()){
            console.log("otp expired");
            return res.status(400).json({message : "otp expires"});
        }
        const user = await User.findOne({phone});
        if(!phone){
            await User.Create({user});
        }
        const token = genToken(user._id,user.phone);
        res.cookie("token",token,{
            httpOnly : true,
            secure : process.env.NODE_ENVIRONMENT === "production",
            samesite : "none",
            maxAge : 7*24*60*60*1000
        })
        return res.status(201).json(token,user);

    } catch (error) {
        return res.status(400).josn({message : "error:",error});
    }
}

export const logOut = async (req,res) => {
    try {
        await res.clearCookie("token");
        res.status(204).json({message : "user logout.."});

    } catch (error) {
        res.status(400).json({message:error});
    }
}