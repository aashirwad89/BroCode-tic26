// routes/auth.routes.js
import express from 'express';
import { sendOtp, verifyOtp, logout } from '../controller/auth.controller.js    ';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);        // ✅ Frontend: `${BASE_URL}/send-otp`
router.post('/verify-otp', verifyOtp);    // ✅ Frontend: `${BASE_URL}/verify-otp`
router.post('/logout', authMiddleware, logout);

export default router;