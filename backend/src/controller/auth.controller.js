// controller/auth.controller.js
import User from '../models/user.model.js';
import { generateOtp } from '../utils/otp.js'; // OTP generation utility
import { sendSMS } from '../utils/sms.js'; // SMS service

// ============ SEND OTP ============
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // ✅ VALIDATION
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    // ✅ GENERATE OTP
    const otp = generateOtp();
    console.log(`🔐 Generated OTP for ${phone}: ${otp}`);

    // ✅ SAVE OTP TO DATABASE (with expiry)
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    let user = await User.findOne({ phone });

    if (user) {
      // Update existing user
      user.otp = otp;
      user.otpExpiry = expiryTime;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        phone,
        otp,
        otpExpiry: expiryTime,
      });
    }

    // ✅ SEND SMS
    // await sendSMS(phone, `Your OTP is: ${otp}`);

    console.log('✅ OTP sent successfully');

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phone, // ✅ SEND BACK PHONE FOR FRONTEND
      data: {
        phone,
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

    // ✅ VALIDATION
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    // ✅ FIND USER
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please send OTP first.',
      });
    }

    // ✅ CHECK OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // ✅ CHECK OTP EXPIRY
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    // ✅ GENERATE TOKEN (JWT or session)
    const authToken = user._id.toString(); // Simple token, use JWT in production
    console.log(`✅ Generated auth token for ${phone}`);

    // ✅ CLEAR OTP AFTER VERIFICATION
    user.otp = null;
    user.otpExpiry = null;
    user.isVerified = true;
    user.lastLoginAt = new Date();
    await user.save();

    console.log('✅ OTP verified successfully');

    // ✅ RETURN RESPONSE WITH PHONE NUMBER AND TOKEN
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        phone, // ✅ IMPORTANT: Return phone number
        authToken, // ✅ IMPORTANT: Return token
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
    const userId = req.userId; // From auth middleware

    // ✅ UPDATE USER STATUS
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