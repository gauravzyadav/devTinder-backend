const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // 🔧 UPDATED: Check for token in multiple places
    let token = null;

    // First, try to get token from cookies (for same-domain requests)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Then, try to get token from Authorization header (for cross-domain requests)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({ message: "Please Login!" });
    }

    // Validate the token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found in DB");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Error: " + err.message });
  }
};

module.exports = { userAuth };