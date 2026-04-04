import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes           from './src/routes/auth.routes.js';
import audioRoutes          from './src/routes/audio.routes.js';
import trustedContactsRoutes from './src/routes/trustedContacts.routes.js';
import locationRoutes       from './src/routes/location.routes.js';
import sosRoutes            from './src/routes/sos.routes.js'; // ✅ NEW

import { locationSocket } from './sockets/location.socket.js';

dotenv.config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

locationSocket(io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api',                  authRoutes);
app.use('/api/aud',              audioRoutes);
app.use('/api/location',         locationRoutes);
app.use('/api/trustedContacts',  trustedContactsRoutes); // ✅ fixed: hyphen hata ke camelCase
app.use('/api/sos',              sosRoutes);             // ✅ NEW

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://10.252.189.103:${PORT}`);
});