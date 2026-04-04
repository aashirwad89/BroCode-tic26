// controller/auth.controller.js
import User from '../models/user.model.js';
import { generateOtp } from '../utils/otp.js';
import { sendSMS } from '../utils/sms.js';

// ============ SEND OTP ============
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    const otp = generateOtp();
    console.log(`🔐 Generated OTP for ${phone}: ${otp}`);

    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ phone });

    if (user) {
      user.otp = otp;
      user.otpExpiry = expiryTime;
      await user.save();
    } else {
      user = await User.create({
        phone,
        otp,
        otpExpiry: expiryTime,
      });
    }

    // await sendSMS(phone, `Your OTP is: ${otp}`);

    console.log('✅ OTP sent successfully');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phone,
      data: {
        phone,
        otp,           // ✅ DEV MODE: Frontend ko OTP dikhane ke liye
        otpExpiry: expiryTime,
      },
    });
  } catch (error) {
    console.error('❌ Error in sendOtp:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
      error: error.message,
    });
  }
};

// ============ VERIFY OTP ============
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please send OTP first.',
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    const authToken = user._id.toString();
    console.log(`✅ Generated auth token for ${phone}`);

    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    console.log('✅ OTP verified successfully');

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        phone,
        authToken,
        user: {
          id: user._id,
          phone: user.phone,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error in verifyOtp:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// ============ LOGOUT ============
export const logout = async (req, res) => {
  try {
    const userId = req.userId;

    await User.findByIdAndUpdate(userId, {
      isActive: false,
      lastLogoutAt: new Date(),
    });

    console.log('✅ User logged out successfully');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};