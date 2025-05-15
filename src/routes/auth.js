const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");


// signup account
authRouter.post("/signup", async (req, res) => {
    try {
      //Validate the data
      validateSignUpData(req);
  
      const { firstName, lastName, emailId, password } = req.body;
  
      //Encrypt the password
      const passwordHash = await bcrypt.hash(password, 10);
      //console.log(passwordHash);
  
      //Creating a new instance of the model
      const user = new User({
        firstName,
        lastName,
        emailId,
        password: passwordHash,
      });
  
      await user.save();
      res.send("User Added Successfully!");
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  });

  // login account
  authRouter.post("/login", async (req, res) => {
    try {
      const { emailId, password } = req.body;
  
      //is email id present in db
      const user = await User.findOne({ emailId: emailId });
      if (!user) {
        throw new Error("Invalid credentials");
      }
      //is passord matches with th eemail id paasword in db
      const isPasswordValid = await user.validatePassword(password);
  
      if (isPasswordValid) {
        // create JWT token
        const token = await user.getJWT();
  
        // add the token to the cookie and send back it to the browser
        res.cookie("token", token);
        res.send("User login successfully!!");
      } else {
        res.send("Invalid credentials");
      }
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }
  });

  
  module.exports = authRouter; 