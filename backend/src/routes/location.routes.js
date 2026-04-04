import express from "express";

const router = express.Router();

/**
 * @route   POST /api/location/share
 * @desc    Start sharing location
 */
router.post("/share", async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;

    if (!userId || !lat || !lng) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    // For now just response (real-time Socket.io se handle hoga)
    return res.status(200).json({
      message: "Location sharing started",
      data: { userId, lat, lng },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/location/update
 * @desc    Update location (optional REST fallback)
 */
router.post("/update", async (req, res) => {
  try {
    const { userId, lat, lng } = req.body;

    return res.status(200).json({
      message: "Location updated",
      data: { userId, lat, lng },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;