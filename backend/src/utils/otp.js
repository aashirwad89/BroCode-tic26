// utils/otp.js
import crypto from 'crypto';

// ============ GENERATE OTP ============
/**
 * Generates a random 4-digit OTP
 * @returns {string} 4-digit OTP
 */
export const generateOtp = () => {
  // Generate random number between 1000-9999
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};

// ============ GENERATE STRONG OTP (6-digit) ============
/**
 * Generates a stronger 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateStrongOtp = () => {
  // Generate random number between 100000-999999
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

// ============ GENERATE CRYPTO OTP ============
/**
 * Generates cryptographically secure OTP
 * More secure but slower
 * @param {number} length - Length of OTP (default: 4)
 * @returns {string} OTP of specified length
 */
export const generateCryptoOtp = (length = 4) => {
  try {
    const buffer = crypto.randomBytes(length);
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += (buffer[i] % 10).toString();
    }
    
    return otp;
  } catch (error) {
    console.error('Error generating crypto OTP:', error);
    // Fallback to regular OTP
    return generateOtp();
  }
};

// ============ VERIFY OTP ============
/**
 * Verifies if provided OTP matches the stored OTP
 * @param {string} providedOtp - OTP provided by user
 * @param {string} storedOtp - OTP stored in database
 * @returns {boolean} true if OTPs match
 */
export const verifyOtp = (providedOtp, storedOtp) => {
  if (!providedOtp || !storedOtp) {
    return false;
  }
  
  // Trim and compare
  return providedOtp.trim() === storedOtp.trim();
};

// ============ CHECK OTP EXPIRY ============
/**
 * Checks if OTP has expired
 * @param {Date} expiryTime - OTP expiry timestamp
 * @param {number} expiryMinutes - How many minutes until expiry (default: 5)
 * @returns {boolean} true if OTP is expired
 */
export const isOtpExpired = (expiryTime, expiryMinutes = 5) => {
  if (!expiryTime) {
    return true;
  }
  
  const currentTime = new Date();
  const otpTime = new Date(expiryTime);
  
  // Check if current time is past expiry time
  return currentTime > otpTime;
};

// ============ GET OTP EXPIRY TIME ============
/**
 * Calculates OTP expiry time
 * @param {number} minutes - Minutes until expiry (default: 5)
 * @returns {Date} Expiry timestamp
 */
export const getOtpExpiryTime = (minutes = 5) => {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + minutes);
  return expiryTime;
};

// ============ FORMAT OTP MESSAGE ============
/**
 * Formats OTP message for SMS
 * @param {string} otp - OTP to include in message
 * @param {string} appName - Name of the app
 * @returns {string} Formatted message
 */
export const formatOtpMessage = (otp, appName = 'SafetyApp') => {
  return `Your ${appName} OTP is: ${otp}. This OTP will expire in 5 minutes. Do not share this OTP with anyone.`;
};

// ============ VALIDATE OTP FORMAT ============
/**
 * Validates if OTP has correct format (numeric only)
 * @param {string} otp - OTP to validate
 * @param {number} length - Expected length (default: 4)
 * @returns {boolean} true if format is valid
 */
export const isValidOtpFormat = (otp, length = 4) => {
  if (!otp) {
    return false;
  }
  
  // Check if only digits and correct length
  const otpRegex = new RegExp(`^[0-9]{${length}}$`);
  return otpRegex.test(otp);
};

// ============ RATE LIMITING ============
/**
 * Checks if user can send OTP (rate limiting)
 * @param {Date} lastOtpSentTime - Timestamp of last OTP sent
 * @param {number} cooldownSeconds - Cooldown period in seconds (default: 60)
 * @returns {boolean} true if user can send OTP
 */
export const canSendOtp = (lastOtpSentTime, cooldownSeconds = 60) => {
  if (!lastOtpSentTime) {
    return true;
  }
  
  const currentTime = new Date();
  const timeDifference = (currentTime - lastOtpSentTime) / 1000; // Convert to seconds
  
  return timeDifference > cooldownSeconds;
};

// ============ GET REMAINING TIME FOR RESEND ============
/**
 * Gets remaining time before user can resend OTP
 * @param {Date} lastOtpSentTime - Timestamp of last OTP sent
 * @param {number} cooldownSeconds - Cooldown period in seconds (default: 60)
 * @returns {number} Remaining seconds (0 if can send)
 */
export const getResendCooldownTime = (lastOtpSentTime, cooldownSeconds = 60) => {
  if (!lastOtpSentTime) {
    return 0;
  }
  
  const currentTime = new Date();
  const timeDifference = (currentTime - lastOtpSentTime) / 1000;
  const remaining = cooldownSeconds - timeDifference;
  
  return remaining > 0 ? Math.ceil(remaining) : 0;
};

// ============ INCREMENT OTP ATTEMPTS ============
/**
 * Tracks OTP verification attempts for security
 * @param {number} currentAttempts - Current attempt count
 * @param {number} maxAttempts - Maximum allowed attempts (default: 3)
 * @returns {object} { canAttempt, remainingAttempts, isBlocked }
 */
export const trackOtpAttempt = (currentAttempts = 0, maxAttempts = 3) => {
  const canAttempt = currentAttempts < maxAttempts;
  const remainingAttempts = maxAttempts - currentAttempts;
  const isBlocked = currentAttempts >= maxAttempts;
  
  return {
    canAttempt,
    remainingAttempts,
    isBlocked,
    nextAttemptNumber: currentAttempts + 1,
  };
};

// ============ HASH OTP (for secure storage) ============
/**
 * Hashes OTP for secure storage in database
 * Note: Use this if you want to store hashed OTP instead of plain text
 * @param {string} otp - OTP to hash
 * @returns {string} Hashed OTP
 */
export const hashOtp = (otp) => {
  try {
    const hash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    return hash;
  } catch (error) {
    console.error('Error hashing OTP:', error);
    return null;
  }
};

// ============ VERIFY HASHED OTP ============
/**
 * Verifies hashed OTP
 * @param {string} providedOtp - OTP provided by user
 * @param {string} hashedOtp - Hashed OTP from database
 * @returns {boolean} true if OTPs match
 */
export const verifyHashedOtp = (providedOtp, hashedOtp) => {
  try {
    const hash = hashOtp(providedOtp);
    return hash === hashedOtp;
  } catch (error) {
    console.error('Error verifying hashed OTP:', error);
    return false;
  }
};

// ============ EXAMPLE USAGE ============
/*
// Generate OTP
const otp = generateOtp();
console.log('Generated OTP:', otp); // e.g., "5432"

// Get expiry time
const expiryTime = getOtpExpiryTime(5); // 5 minutes
console.log('Expiry Time:', expiryTime);

// Format message for SMS
const message = formatOtpMessage(otp, 'SafetyApp');
console.log('SMS Message:', message);

// Validate OTP format
const isValid = isValidOtpFormat(otp, 4);
console.log('Is Valid Format:', isValid); // true

// Check if expired
const expired = isOtpExpired(expiryTime);
console.log('Is Expired:', expired); // false

// Check rate limiting
const lastSent = new Date(Date.now() - 30000); // 30 seconds ago
const canSend = canSendOtp(lastSent, 60); // 60 second cooldown
console.log('Can Send OTP:', canSend); // false (need to wait 30 more seconds)

// Get resend cooldown time
const cooldown = getResendCooldownTime(lastSent, 60);
console.log('Wait', cooldown, 'more seconds'); // Wait 30 more seconds

// Track attempts
const attempt = trackOtpAttempt(1, 3);
console.log('Attempt Info:', attempt);
// {
//   canAttempt: true,
//   remainingAttempts: 2,
//   isBlocked: false,
//   nextAttemptNumber: 2
// }
*/

export default {
  generateOtp,
  generateStrongOtp,
  generateCryptoOtp,
  verifyOtp,
  isOtpExpired,
  getOtpExpiryTime,
  formatOtpMessage,
  isValidOtpFormat,
  canSendOtp,
  getResendCooldownTime,
  trackOtpAttempt,
  hashOtp,
  verifyHashedOtp,
};