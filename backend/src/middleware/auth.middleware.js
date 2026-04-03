// middleware/auth.middleware.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization; // ✅ Fixed: req.headers, not req.header
  if (!header) {
    return res.status(401).json({ message: "user not authorized." });
  }

  const token = header.split(" ")[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

export default authMiddleware;