// controllers/auth.controller.js
import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import genToken from "../config/token.config.js";
import otpGenerator from "otp-generator";

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone || phone.trim() === "") {
      return res.status(400).json({ message: "Phone number is required" });
    }
    
    if (!/^(\d{10}|\d{12})$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 or 12 digits" });
    }

    await Otp.deleteMany({ phone });

    const otp = otpGenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    
    const createOtp = await Otp.create({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    if (!createOtp) {
      return res.status(500).json({ message: "Failed to store OTP" });
    }

    console.log("✅ OTP stored in DB:", otp);
    return res.status(200).json({
      message: "OTP sent successfully",
      otp: otp, // Remove in production!
    });

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
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }
    
    const record = await Otp.findOne({ phone, otp });
    
    if (!record) {
      return res.status(404).json({ message: "Invalid OTP" });
    }
    
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = await User.create({ phone });
    }
    
    const token = genToken(user._id, user.phone);
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    return res.status(200).json({
      message: "OTP verified successfully",
      token: token,
      userId: user._id.toString()
    });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: "Verification error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Logout error", error: error.message });
  }
};