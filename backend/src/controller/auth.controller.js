import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import genToken from "../config/token.config.js";
import otpGenerator from "otp-generator";

export const genOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // ✅ Better validation
    if (!phone || phone.trim() === "") {
      return res.status(400).json({ message: "Phone number is required" });
    }
    
    // ✅ Validate phone format
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }
    
    // ✅ Check if OTP already exists for this phone
    await Otp.deleteMany({ phone }); // Clear old OTPs
    
    const otp = otpGenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    
    const createOtp = await Otp.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    
    if (createOtp) {
      console.log("✅ OTP stored in DB:", otp);
      return res.status(200).json({
        message: "OTP sent successfully",
        otp: otp, // Remove in production!
      });
    }

  } catch (error) {
    console.error("❌ OTP generation failed:", error.message);
    return res.status(500).json({
      message: "Failed to generate OTP",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
    try {
        const {phone,otp} = req.body;
        
        if(!phone || !otp) {
            return res.status(400).json({message: "Phone and OTP required"});
        }
        
        const record = await Otp.findOne({phone,otp});
        
        if(!record){
            console.log("invalid otp");
            return res.status(404).json({message : "Invalid OTP"});
        }
        
        if(record.expiresAt < new Date()){
            console.log("otp expired");
            return res.status(400).json({message : "OTP expired"});
        }
        
        let user = await User.findOne({phone});
        
        // ✅ FIX: Changed User.Create to User.create (lowercase) and fixed syntax
        if(!user){
            user = await User.create({phone});
        }
        
        const token = genToken(user._id, user.phone);
        
        res.cookie("token", token, {
            httpOnly : true,
            secure : process.env.NODE_ENVIRONMENT === "production",
            sameSite : "none", // ✅ FIX: Changed samesite to sameSite
            maxAge : 7*24*60*60*1000
        });
        
        // ✅ FIX: Correct JSON response syntax
        return res.status(201).json({
            message: "OTP verified successfully",
            token: token,
            userId: user._id
        });

    } catch (error) {
        console.error("Verification error:", error);
        // ✅ FIX: Changed josn to json
        return res.status(400).json({message : "Verification error", error: error.message});
    }
}

export const logOut = async (req,res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({message : "User logged out successfully"});

    } catch (error) {
        return res.status(400).json({message: "Logout error", error: error.message});
    }
}