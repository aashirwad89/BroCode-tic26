import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "*",
}));

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', authRoutes);

// routes
app.use('/api/aud', audioRoutes);

// ✅ FIX: remove '*' here
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://10.252.189.103:${PORT}`);
});