const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers.authorization; // Express headers are auto converted to lowercase
  if (token) {
    if (token.startsWith("Bearer ")) {
      // Remove "Bearer" from string
      token = token.slice(7, token.length);
    }
    const secret = process.env.SECRET;
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Token is invalid",
        });
      }
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Token was not supplied",
    });
  }
};

const userId = (req, res, next) => {
  if (req.decoded.userId == "") {
    res.status(403).json({
      success: false,
      message: "Permission denied, not a userId",
    });
  } else {
    req.userId = userId;
    next();
  }
};

module.exports = {
  checkToken,
  userId,
};
