// utils/sms.js
import twilio from 'twilio';

// ============ TWILIO SETUP ============
// Get these from https://www.twilio.com/console
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your-account-sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your-auth-token';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize Twilio client
let twilioClient;

const initializeTwilio = () => {
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

// ============ SEND OTP SMS ============
/**
 * Sends OTP via SMS using Twilio
 * @param {string} phoneNumber - Recipient phone number (with country code, e.g., +919876543210)
 * @param {string} otp - OTP to send
 * @param {string} appName - Name of the app
 * @returns {Promise<object>} Twilio response
 */
export const sendSMS = async (phoneNumber, otp, appName = 'SafetyApp') => {
  try {
    console.log(`📱 Sending SMS to ${phoneNumber}...`);

    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      throw new Error('Invalid phone number format');
    }

    // Format phone number with country code if not present
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+91${phoneNumber}`; // India country code
    }

    const client = initializeTwilio();

    const message = await client.messages.create({
      body: `Your ${appName} OTP is: ${otp}. This OTP will expire in 5 minutes. Do not share this OTP with anyone.`,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`✅ SMS sent successfully. SID: ${message.sid}`);

    return {
      success: true,
      messageSid: message.sid,
      phone: formattedPhone,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    return {
      success: false,
      error: error.message,
      phone: phoneNumber,
    };
  }
};

// ============ SEND OTP SMS (Alternative - No Twilio) ============
/**
 * Mock SMS sending (for development/testing)
 * Replace with actual SMS service in production
 * @param {string} phoneNumber - Phone number
 * @param {string} otp - OTP
 * @returns {Promise<object>} Mock response
 */
export const sendSmsMock = async (phoneNumber, otp) => {
  try {
    console.log(`📱 [MOCK] Sending SMS to ${phoneNumber}`);
    console.log(`🔐 [MOCK] OTP: ${otp}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`✅ [MOCK] SMS sent successfully`);

    return {
      success: true,
      isMock: true,
      phone: phoneNumber,
      otp: otp, // Only for testing/development!
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('❌ Error in mock SMS:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============ SEND OTP SMS (Using AWS SNS) ============
/**
 * Sends OTP via SMS using AWS SNS
 * Alternative to Twilio
 * @param {string} phoneNumber - Phone number (with country code)
 * @param {string} otp - OTP to send
 * @returns {Promise<object>} AWS response
 */
export const sendSmsWithAWS = async (phoneNumber, otp) => {
  try {
    console.log(`📱 Sending SMS via AWS SNS to ${phoneNumber}...`);

    // This requires AWS SDK setup
    // Uncomment if using AWS SNS
    /*
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS();

    const params = {
      Message: `Your OTP is: ${otp}. This OTP will expire in 5 minutes.`,
      PhoneNumber: phoneNumber,
    };

    const result = await sns.publish(params).promise();
    console.log('✅ SMS sent via AWS SNS');

    return {
      success: true,
      messageId: result.MessageId,
      phone: phoneNumber,
    };
    */

    // Placeholder
    return {
      success: false,
      error: 'AWS SNS not configured. Please set up AWS credentials.',
    };
  } catch (error) {
    console.error('❌ Error sending SMS via AWS:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============ SEND OTP SMS (Using Firebase) ============
/**
 * Sends OTP via Firebase Phone Authentication
 * Good for React Native apps
 * @param {string} phoneNumber - Phone number
 * @returns {Promise<object>} Firebase response
 */
export const sendSmsWithFirebase = async (phoneNumber) => {
  try {
    console.log(`📱 Sending OTP via Firebase to ${phoneNumber}...`);

    // This is typically handled on the client-side in Firebase
    // This is a placeholder for backend use

    return {
      success: false,
      error: 'Firebase phone auth is typically client-side. Use Firebase SDK in React Native.',
    };
  } catch (error) {
    console.error('❌ Error with Firebase SMS:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============ SEND BULK SMS ============
/**
 * Sends SMS to multiple recipients
 * @param {array} phoneNumbers - Array of phone numbers
 * @param {string} message - Message to send
 * @returns {Promise<array>} Results for each phone number
 */
export const sendBulkSms = async (phoneNumbers, message) => {
  try {
    console.log(`📱 Sending bulk SMS to ${phoneNumbers.length} recipients...`);

    const client = initializeTwilio();
    const results = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const sms = await client.messages.create({
          body: message,
          from: TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });

        results.push({
          success: true,
          phone: phoneNumber,
          messageSid: sms.sid,
        });
      } catch (error) {
        results.push({
          success: false,
          phone: phoneNumber,
          error: error.message,
        });
      }
    }

    console.log(`✅ Bulk SMS completed`);
    return results;
  } catch (error) {
    console.error('❌ Error in bulk SMS:', error);
    return [];
  }
};

// ============ CHECK SMS DELIVERY STATUS ============
/**
 * Checks delivery status of sent SMS
 * @param {string} messageSid - Message SID from Twilio
 * @returns {Promise<object>} Delivery status
 */
export const checkSmsStatus = async (messageSid) => {
  try {
    const client = initializeTwilio();
    const message = await client.messages(messageSid).fetch();

    console.log(`📊 SMS Status for ${messageSid}: ${message.status}`);

    return {
      success: true,
      status: message.status, // 'queued', 'sending', 'sent', 'failed', 'delivered'
      messageSid: messageSid,
      sentAt: message.dateSent,
      errorMessage: message.errorMessage || null,
    };
  } catch (error) {
    console.error('❌ Error checking SMS status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============ FORMAT PHONE NUMBER ============
/**
 * Formats phone number to international format
 * @param {string} phone - Phone number (can be 10 digits or with country code)
 * @param {string} countryCode - Country code (default: +91 for India)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, countryCode = '+91') => {
  if (!phone) {
    return null;
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If already has country code length, assume it's international
  if (cleaned.length > 10) {
    return '+' + cleaned;
  }

  // Add country code to 10-digit number
  return countryCode + cleaned.slice(-10);
};

// ============ VALIDATE PHONE NUMBER ============
/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @param {string} countryCode - Country code (default: 91 for India)
 * @returns {boolean} true if valid
 */
export const isValidPhoneNumber = (phone, countryCode = '91') => {
  if (!phone) {
    return false;
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid length (10 digits for most countries)
  return cleaned.length === 10 || cleaned.length === 12;
};

// ============ SEND EMAIL OTP (Alternative) ============
/**
 * Sends OTP via email
 * Useful as backup authentication method
 * @param {string} email - Email address
 * @param {string} otp - OTP to send
 * @param {string} appName - App name
 * @returns {Promise<object>} Result
 */
export const sendOtpViaEmail = async (email, otp, appName = 'SafetyApp') => {
  try {
    console.log(`📧 Sending OTP email to ${email}...`);

    // This requires email service setup (nodemailer, SendGrid, etc.)
    // Placeholder for now

    return {
      success: false,
      error: 'Email OTP service not configured. Set up nodemailer or SendGrid.',
    };
  } catch (error) {
    console.error('❌ Error sending email OTP:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  sendSMS,
  sendSmsMock,
  sendSmsWithAWS,
  sendSmsWithFirebase,
  sendBulkSms,
  checkSmsStatus,
  formatPhoneNumber,
  isValidPhoneNumber,
  sendOtpViaEmail,
};