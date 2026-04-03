import express from 'express';
import { upload } from '../middleware/upload.js';
import Audio from '../models/audio.model.js';

const router = express.Router();

router.post('/audio/upload', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file.path;

    const saved = await Audio.create({
      file: filePath
    });

    res.json({ success: true, data: saved });

  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;