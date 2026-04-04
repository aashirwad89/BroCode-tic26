// src/controllers/sos.controller.js
import SOSLog        from '../models/sos.model.js';
import TrustedContact from '../models/TrustedContact.js';

// POST /api/sos/trigger
export const triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude, audioPath } = req.body;

    if (!latitude || !longitude)
      return res.status(400).json({ success: false, message: 'Location required hai' });

    // ✅ TrustedContact.find() — model se call karo
    const contacts = await TrustedContact.find();
    const phones   = contacts.map((c) => c.phone);

    // ✅ SOSLog.create() — model se call karo
    const log = await SOSLog.create({
      latitude,
      longitude,
      audioPath:        audioPath || '',
      contactsNotified: phones,
    });

    res.status(201).json({
      success: true,
      data: {
        logId:    log._id,
        contacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// GET /api/sos/logs
export const getSOSLogs = async (_req, res) => {
  try {
    // ✅ SOSLog.find() — model se call karo
    const logs = await SOSLog.find().sort({ triggeredAt: -1 });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};