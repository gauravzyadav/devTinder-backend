const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");

// 🔧 UPDATED SIGNUP ROUTE
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate the data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of the model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    // Set cookie (for same-domain requests)
    res.cookie("token", token, {
      expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });    

    // 🔧 ALSO send token in response (for cross-domain requests)
    res.json({
      message: "User Added Successfully!",
      user: savedUser,
      token: token, // ← Key addition for cross-domain
    });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// 🔧 UPDATED LOGIN ROUTE
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // is email id present in db
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // is password matches with the email id password in db
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // create JWT token
      const token = await user.getJWT();

      // Set cookie (for same-domain requests)
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000), // 8 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      // 🔧 ALSO send token in response (for cross-domain requests)
      res.json({
        message: "Login successful",
        user: user,
        token: token, // ← Key addition for cross-domain
      });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// 🔧 UPDATED LOGOUT ROUTE
authRouter.post("/logout", userAuth, async (req, res) => {
  try {
    // Clear cookie
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // 🔧 Send JSON response instead of plain text
    res.json({ message: "Logout Successful" });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
});

module.exports = authRouter;