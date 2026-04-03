// config/token.config.js
import jwt from 'jsonwebtoken';

const genToken = (userId, phone) => {
  return jwt.sign(
    { 
      userId: userId.toString(),
      phone 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

export default genToken;