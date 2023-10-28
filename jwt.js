const jwt = require("jsonwebtoken");
const { secretKey } = require("./constants");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bearer token not provided' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      req.userId = Number(decoded.userId);
      next();
    }
  });
}

module.exports = { verifyToken };
